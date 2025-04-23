//Dclare the Schema of the Mongo model
var productSchema = new  ({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
   },
   description: {
        type: String,
        required: true,


   },
   price: {
    type: Number,
    required: true,
   },
   category: {
    type: String,
    required: true,
   },
   brand: {
     type: String,
     required: true,
   },

   quantity: {
    type: Number,
    required: true,
    select: false,
   },
    sold: {
       type: Number,
        default: 0,
        select: false,
    },
    images: {
        type: Array,
    },
   color: {
    type: String,
    required: true,
   },
   ratings: [
    {
    star: Number,
    postedby: { type: , ref: "" },
   },
],
}, ({timestamps:true}));

//Export the model
module.exports =  ("")

