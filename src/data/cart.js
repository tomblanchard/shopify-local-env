var product = require('./product');

module.exports = {
  "attributes": false,
  "item_count": 1,
  "items": [
    {
      "fulfillment": {
        "tracking_company": "UPS",
        "tracking_number": 12345,
        "tracking_url": "http://shopify.com"
      },
      "grams": 5,
      "id": 1,
      "image": product.featured_image,
      "line_price": 100,
      "price": 100,
      "product": product,
      "quantity": 1
    }
  ],
  "note": "This is the cart note.",
  "total_price": 100,
  "total_weight": 1
}