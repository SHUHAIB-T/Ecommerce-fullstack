const express = require('express');
const { authenicateUser } = require('../middlewares/authMiddleware');
const router = express.Router();

const { get_reviews,
    new_review, render_new_review,
    render_edit_review,
    edit_review, delete_review } = require('../controller/reviewController');

router.get('/', authenicateUser, get_reviews);

router.post('/add-review', authenicateUser, new_review);

router.get('/new-review/:id', authenicateUser, render_new_review);

router.get('/edit-reivew/:id', authenicateUser, render_edit_review);

router.post('/edit_review', authenicateUser, edit_review);

router.get('/delete-reivew/:id', authenicateUser, delete_review);


module.exports = router;