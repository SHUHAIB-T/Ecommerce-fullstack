const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/productImages'), (err, success) => {
      if (err) {
        throw new err
      }
    });
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name, (err, success) => {
      if (err)
        throw new err
    });
  }
});

const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/banners'), (err, success) => {
      if (err) {
        throw new err
      }
    });
  },

  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name, (err, success) => {
      if (err)
        throw new err
    });
  }
});

//uploading product images
const upload = multer({ storage: storage });

//uploading banner images
const upload1 = multer({ storage: storage1 });

module.exports = {
  upload,
  upload1
}