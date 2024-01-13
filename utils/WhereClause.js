
const WhereClause = class {
   #base;
   #bigQuery;

   constructor(base,bigQuery) {
       this.#base = base;
       this.#bigQuery = bigQuery
   }
    search() {
       const searchWord = this.#bigQuery.search? {
         name: {
             $regex: this.#bigQuery.search,
             $options: 'i'
         }
       } : {}

       this.#base =  this.#base.find({...searchWord})
        console.log(`result is : ${this.#base}`)

        return this.#base
   }

   pagination(resultPerPage) {
       let currentPage = 1;
       if(this.#bigQuery.page) {
           currentPage = this.#bigQuery.page;
       }
       const skipValues = resultPerPage * (currentPage - 1);
       this.#base = this.#base.limit(resultPerPage).skip(skipValues)
       console.log(`base: ${this.#base}`)
       return this.#base
   }

   filter() {
       let copyQuery = {...this.#bigQuery};
       delete copyQuery["search"]
       delete copyQuery["limit"]
       delete copyQuery["page"]

       // converting to string
       let stringOfCopyQuery = JSON.stringify(copyQuery);

       // Regex
       stringOfCopyQuery = stringOfCopyQuery.replace(/\b(gte|lte|gt|lt)\b/g, m => `$${m}`)
       const jsonOfCopyQuery = JSON.parse(stringOfCopyQuery);
       
       this.#base = this.#base.find(jsonOfCopyQuery)
       return this.#base

   }

}

module.exports = WhereClause