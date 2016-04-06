var product = require('./product');
var article = require('./article');

module.exports = {
  "main-menu": {
    "handle": "main-menu",
    "id": 1,
    "links": [
      {
        "active": false,
        "object": {},
        "title": "Home",
        "handle": "home",
        "type": "relative_link",
        "url": "index.html"
      },
      {
        "active": false,
        "object": {
          "title": "Page",
          "content": "This is the page content."
        },
        "title": "Page",
        "handle": "page",
        "type": "page_link",
        "url": "page.html"
      },
      {
        "active": false,
        "object": {
          "title": "Collection",
          "products": [
            product
          ]
        },
        "title": "Collection",
        "handle": "collection",
        "type": "collection_link",
        "url": "collection.html"
      },
      {
        "active": false,
        "object": {
          "all_tags": [
            "tag1",
            "tag2",
            "tag3",
            "tag4"
          ],
          "articles": [
            article
          ],
          "articles_count": 1,
          "comments_enabled?": true,
          "handle": "blog",
          "id": 1,
          "moderated?": true,
          "next_article": false,
          "previous_article": false,
          "tags": [
            "tag1",
            "tag2",
            "tag3",
            "tag4"
          ],
          "title": "Blog",
          "handle": "blog",
          "url": "blog.html"
        },
        "title": "Blog",
        "type": "blog_link",
        "url": "blog.html"
      },
      {
        "active": false,
        "object": {
         "title": "Page",
          "content": "This is the page content."
        },
        "title": "Contact",
        "handle": "contact",
        "type": "page_link",
        "url": "page.contact.html"
      }
    ],
    "title": "Main Menu"
  },
  "footer": {
    "handle": "footer",
    "id": 2,
    "links": [
      {
        "active": false,
        "object": {},
        "title": "Footer Col 1",
        "handle": "footer-col-1",
        "type": "relative_link",
        "url": "index.html"
      },
      {
        "active": false,
        "object": {},
        "title": "Footer Col 2",
        "handle": "footer-col-2",
        "type": "relative_link",
        "url": "index.html"
      },
      {
        "active": false,
        "object": {},
        "title": "Footer Col 3",
        "handle": "footer-col-3",
        "type": "relative_link",
        "url": "index.html"
      }
    ]
  },
  "footer-footer-col-1": {
    "handle": "footer-footer-col-1",
    "id": 3,
    "links": [
      {
        "active": false,
        "object": {},
        "title": "Footer Col 1 Link 1",
        "handle": "footer-col-1-link-1",
        "type": "relative_link",
        "url": "index.html"
      },
      {
        "active": false,
        "object": {},
        "title": "Footer Col 1 Link 2",
        "handle": "footer-col-1-link-2",
        "type": "relative_link",
        "url": "index.html"
      },
      {
        "active": false,
        "object": {},
        "title": "Footer Col 1 Link 3",
        "handle": "footer-col-1-link-3",
        "type": "relative_link",
        "url": "index.html"
      }
    ]
  },


  "footer-footer-col-2": {
    "handle": "footer-footer-col-2",
    "id": 3,
    "links": [
      {
        "active": false,
        "object": {},
        "title": "Footer Col 2 Link 1",
        "handle": "footer-col-2-link-1",
        "type": "relative_link",
        "url": "index.html"
      },
      {
        "active": false,
        "object": {},
        "title": "Footer Col 2 Link 2",
        "handle": "footer-col-2-link-2",
        "type": "relative_link",
        "url": "index.html"
      },
      {
        "active": false,
        "object": {},
        "title": "Footer Col 2 Link 3",
        "handle": "footer-col-2-link-3",
        "type": "relative_link",
        "url": "index.html"
      }
    ]
  },


  "footer-footer-col-3": {
    "handle": "footer-footer-col-3",
    "id": 3,
    "links": [
      {
        "active": false,
        "object": {},
        "title": "Footer Col 3 Link 1",
        "handle": "footer-col-3-link-1",
        "type": "relative_link",
        "url": "index.html"
      },
      {
        "active": false,
        "object": {},
        "title": "Footer Col 3 Link 2",
        "handle": "footer-col-3-link-2",
        "type": "relative_link",
        "url": "index.html"
      },
      {
        "active": false,
        "object": {},
        "title": "Footer Col 3 Link 3",
        "handle": "footer-col-3-link-3",
        "type": "relative_link",
        "url": "index.html"
      }
    ]
  },

  "social-media": {
    "handle": "social-media",
    "id": 4,
    "links": [
      {
        "active": false,
        "object": {},
        "title": "Twitter",
        "handle": "twitter",
        "type": "relative_link",
        "url": "http://twitter.com"
      },
      {
        "active": false,
        "object": {},
        "title": "Facebook",
        "handle": "facebook",
        "type": "relative_link",
        "url": "http://facebook.com"
      }
    ]
  }
}