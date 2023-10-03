const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');


//VIEW ALL TAGS
//http://localhost/api/tags
router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tag = await Tag.findAll({
      include: [{model: Product}],
    });
    
    res.status(200).json(tag);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

//VIEW TAG BY ID
//http://localhost/api/tags/{user input}
router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const tagId = await Tag.findByPk(req.params.id, {
      include: [{model: Product}]
    });
    (tagId ? res.status(200).json(tagId) : res.status(404).json("Id out of range"));
  }catch (err) {
    res.status(400).json(err)
  }
});

//CREATE A NEW TAG
//http://localhost/api/tags/
router.post('/', (req, res) => {
  // create a new tag
 /* req.body should look like this...
    {
      tag_name: "A new tag",
      prodIds: [1,2,3,4]
    }
  */
Tag.create({
      tag_name: req.body.tag_name,

    }).then((data)=> {
      if (req.body.prodIds.length) {
            const productTagIdArr = req.body.prodIds.map((prod_id) => {
              return {
                product_id: prod_id,
                tag_id: data.id,
              };
            });
            return ProductTag.bulkCreate(productTagIdArr);
    }
    res.status(200).json(data);
  })
  .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

//UPDATE A TAG
//http://localhost/api/tags/{user input}
router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  /* req.body should look like this...
    {
      tag_name: "A new tag",
    }
  */
  try {
    const updateTag = await Tag.update({
      tag_name: req.body.tag_name
    },
    {
      where: {
        id: req.params.id
      }
    })
    
    if (updateTag[0]) {
      res.status(200).json("Tag updated successfully")
    } else {
      res.status(404).json("id out of range")
    }
  }catch (err) {
    console.log(err);
    res.status(400).json(err)
  }
});

//DELETE A TAG BY ID
//http://localhost/api/tags/{user input}
router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try {
    const deleteTag = await Tag.destroy({
      where: {
        id: req.params.id
      }
    })
    if (deleteTag){
      res.status(200).json(`Deleted id at value: ${req.params.id}`)
      console.log(`Category at id ${req.params.id} deleted`)
    }else{
      res.status(404).json("Id out of range")
    }
  } catch (err) {
      console.log(err);
      res.status(400).json(err)
  }
});

module.exports = router;
