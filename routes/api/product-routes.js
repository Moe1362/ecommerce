const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
      include: [{ model: Category }, { model: Tag, through: ProductTag}],
    });
  
    if(!productData) {
      res.status(400).json({ message: 'No products found' });
      return;
    }
    res.status(200).json(productData);
   
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    const productData = await Product.findOne({
      where: { id: req.params.id },
      include: [{ model: Category }, { model: Tag, through: ProductTag}],
    });
  
    if(!productData) {
      res.status(400).json({ message: 'No products found' });
      return;
    }
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
 try {
    const productData = await Product.create(req.body);
    if(!productData) {
      res.status(400).json({ message: 'No products found' });
      return;
    }
    res.status(200).json(productData);
  
 } catch (err) {
    res.status(400).json(err);
  }
});
  



// update product
router.put('/:id', async (req, res) => {
  try {
    const productData = await Product.update(req.body, {
      where: { id: req.params.id },
    });
    if(req.body.tagIds && req.body.tagIds.length) {
      const productTags = ProductTag.findAll({ where: { product_id: req.params.id } });
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          }
        })
      const productTagsToRemove = (await productTags).filter(({ tag_id }) => !req.body.tagIds.includes(tag_id)).map(({ id }) => id);

      await ProductTag.destroy({ where: { id: productTagsToRemove } });
      await ProductTag.bulkCreate(newProductTags);
      return res.json(productData);
    }
    res.status(200).json(productData);
  
  } catch (err) {
    res.status(400).json(err);
  }

});

router.delete('/:id', async (req, res) => {
  try {
    const productData = await Product.destroy({
      where: { id: req.params.id },
    });
    if(!productData) {
      res.status(400).json({ message: 'No products found' });
      return;
    }
    res.status(200).json(productData);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
