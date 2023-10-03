const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');


// VIEW ALL PRODUCTS
//http://localhost/api/products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try {
    const productAll = await Product.findAll({
      include: [{model: Category},{model: Tag}]
    })
    res.status(200).json(productAll);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// VIEW ONE PRODUCT BY ID
//http://localhost/api/products/{user input}
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try {
    const productId = await Product.findByPk(req.params.id, {
      include: [{model: Category},{model: Tag}]
    });
    (productId ? res.status(200).json(productId) : res.status(404).json("Id out of range"));
  }catch (err) {
    res.status(400).json(err)
  }
});

// CREATE NEW PRODUCT
//http://localhost/api/products/
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      category_id: 1
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// UPDATE PRODUCT
//http://localhost/api/products/{user input}
router.put('/:id', (req, res) => {
  // update product data
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      category_id: 1
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        
        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });

            // figure out which ones to remove
          const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
                  // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

//DELETE REQUEST
//http://localhost/api/products/{user input}
router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const deleteProd = await Product.destroy({
      where: {
        id: req.params.id
      }
    })
    if (deleteProd){
      res.status(200).json(`Deleted id at value: ${req.params.id}`)
      console.log(`Product at id ${req.params.id} deleted`)
    }else{
      res.status(404).json("Id out of range")
    }
  } catch (err) {
      console.log(err);
      res.status(400).json(err)
  }
});

module.exports = router;
