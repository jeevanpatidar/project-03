const reviewmodel = require('../models/reviewModel')
const bookmodel = require('../models/bookModel')
const mongoose = require('mongoose')


module.exports = {
  
reviewbookbybookid: async (req, res) => {
  try {
      let bookid = req.params.bookId
      if(!mongoose.Types.ObjectId.isValid(bookid))return res.status(400).send({ status: false, msg: "Book id is not valid" })
      if(bookid !== req.body.bookId)return res.status(400).send({ status: false, msg: "BookId doesn't match" })
       
      let bookData = await bookmodel.findOneAndUpdate({ _id : req.params.bookId, isDeleted: false }, { $inc: { reviews: 1 } }).select({createdAt:0,updatedAt : 0 ,_id :0 })
      if (!bookData) return res.status(404).send({ status: false, msg: "Book might be deleted or it is not exist" })
       
      let createreviews = await reviewmodel.create(req.body)
      let finalData = {
          title: bookData.title, excerpt: bookData.excerpt, userId: bookData.userId,
          category: bookData.category, subcategory: bookData.subcategory, isDeleted: false, reviews: bookData.reviews,
          createdAt: bookData.createdAt, updatedAt: bookData.updatedAt, reviewsData: createreviews
      }
        res.status(201).send({ status: true, message: "Reviewed book Successfully",Data : finalData})
  } catch (error) {
        res.status(500).send({ status: false, message : error.message})
      }
  },
updatereviewbookbybookid: async (req, res) => {
  try {
      let {bookId ,reviewId} = req.params
      if(!mongoose.Types.ObjectId.isValid(bookId))return res.status(400).send({ status: false, msg: "Bookid is not valid" })
      if(!mongoose.Types.ObjectId.isValid(reviewId))return res.status(400).send({ status: false, msg: "reviewid is not valid" })
          
      let { review, rating, reviewedBy } = req.body

      let bookData = await bookmodel.findOne({ _id: bookId, isDeleted: false })
      if (!bookData) return res.status(404).send({ status: false, msg: "Book might be deleted or its not present" })
        
      let findreviewandupdate = await reviewmodel.findOneAndUpdate({ _id: reviewId, bookId: bookId, isDeleted: false },{reviewedBy :reviewedBy,rating:rating,review:review},{new:true}).select({createdAt:0,updatedAt : 0 ,_id :0 })
      if(!findreviewandupdate)return res.status(404).send({ status: false, msg: "Document not found it must be deleted or incorrect" })
  
      let finalData = {
        title: bookData.title, excerpt: bookData.excerpt, userId: bookData.userId,
        category: bookData.category, subcategory: bookData.subcategory, isDeleted: false, reviews: bookData.reviews,
        createdAt: bookData.createdAt, updatedAt: bookData.updatedAt, reviewsData: findreviewandupdate
      }
        res.status(200).send({ status: true, message: "Data updated Successfully", Data: finalData })
  } catch (error) {
        res.status(500).send({ status: false, message : error.message})
  }
},
deletereviewbyid: async (req, res) => {
  try {
      let {bookId ,reviewId} = req.params
      if(!mongoose.Types.ObjectId.isValid(bookId))return res.status(400).send({ status: false, msg: "Bookid is not valid" })
      if(!mongoose.Types.ObjectId.isValid(reviewId))return res.status(400).send({ status: false, msg: "reviewid is not valid" })
  
      let findreview = await reviewmodel.findOne({ _id: reviewId, isDeleted: false })
      if (!findreview) return res.status(404).send({ status: false, msg: "Review data might be deleted or it does not exist" })
       
      let findbook = await bookmodel.findOneAndUpdate({ _id: bookId, isDeleted: false },{ $inc: { reviews: -1 } })
      if (!findbook) return res.status(404).send({ status: false, msg: "Book data might be deleted or it does not exist" })
  
      await reviewmodel.findOneAndUpdate({ _id: reviewId, bookId: bookId, isDeleted: false },{isDeleted: true },{new:true})
          res.status(200).send({ status: true, message: "Data Deleted Successfully"})
  } catch (error) {
      res.status(500).send({ status: false, message : error.message})
  }
    }
}