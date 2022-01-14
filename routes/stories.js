const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')
const Story = require('../models/Story')

//@desc Show add page
//@route GET /stories/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('stories/add')

})

//@desc Process add form
//@route POST /stories
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    await Story.create(req.body)
    res.redirect('/dashboard')
  }
  catch (err) {
    console.error(err)
    res.render('error/500')
  }

})

router.get('/', ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean()

    res.render('stories/index', {
      stories,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

//@desc Show add page
//@route GET /stories/add
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean()
      .populate('user')
      .lean()

    if (!story) {
      return res.render('error/404')
    }
    res.render('stories/show', {
      story,
    })
  }
  catch (err) {
    console.error(err)
    res.render('error/500')
  }

})

//@desc Show edit page
//@route GET /stories/add
router.get('/edit/:id', ensureAuth, async (req, res) => {
  const story = await Story.findOne({
    _id: req.params.id,
  }).lean()

  if (!story) {
    return res.render('error/404')
  }

  if (story.user != req.user.id) {
    return res.render('error/404')
  }
  else {
    res.render('stories/edit', {
      story,
    })
  }

  //@desc Update story
  //@route PUT /stories/:id
  router.put('/:id', ensureAuth, async (req, res) => {
    try {
      let story = await Story.findById(req.params.id).lean()

      if (!story) {
        return res.render('error/404')
      }
      if (story.user != req.user.id) {
        return res.render('error/404')
      }
      else {
        story = await Story.findByIdAndUpdate({ _id: req.params.id }, req.body, {
          new: true,
          runValidators: true
        })
        res.redirect('/dashboard')
      }
    }
    catch (err) {
      console.error(err)
      res.render('error/500')
    }


  })

  //@desc Delete story
  //@route DELETE /stories/:id
  router.delete('/:id', ensureAuth, async (req, res) => {
    try {
      await Story.remove({ _id: req.params.id })
      res.redirect('/dashboard')
    }
    catch (err) {
      console.error(err)
      res.render('error/500')
    }

  })
})



module.exports = router