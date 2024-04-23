<p align="center">
    <picture>
    <img alt="thalia" src="./assets/logo.png" height="180">
    </picture>
</p>

<p align="center">    
    <a href="">
        <img alt="GitHub" src="https://img.shields.io/badge/node.js-6DA55F?&logo=node.js&logoColor=white">
    </a>   
    <a href="">
        <img alt="GitHub" src="https://img.shields.io/badge/express.js-%23404d59.svg?&logo=express&logoColor=%2361DAFB">
    </a>    
    <a href="">
        <img alt="GitHub" src="https://img.shields.io/badge/handlebars-000000?&logo=handlebars&logoColor=%2361DAFB">
    </a>    
    <a href="">
        <img alt="GitHub" src="https://img.shields.io/badge/MongoDB-%234ea94b.svg?&logo=mongodb&logoColor=white">
    </a>
    <a href="">
        <img alt="GitHub" src="https://img.shields.io/badge/render-000000?&logo=render&logoColor=white">
    </a>
</p>

<h4 align="center">
    <p>
        <a href="https://ecommerce-fullstack-b3nc.onrender.com/">Deployed URL</a>
    <p>
</h4>
Times Cart is an ecommerce platform specializing in the sale of watches. It offers a range of features aimed at providing a seamless shopping experience for users. Below are the key features implemented in the project:

## Features

- **Secure Authentication:** Utilizes JWT for token-based authentication ensuring secure access to user accounts.
- **User Profile and Account Management:** Users can manage their profiles and accounts conveniently through the platform.
- **Cart and Wishlist Management:** Users can add items to their cart for easy checkout and manage their wishlist for future purchases.
- **Discounts Management:** Added Coupen offer for getting descout for the product.
- **Review and Rating System:** Gather feedback from users through a review and rating system.
- **Order Tracking:** Track the status of orders, with options to return or cancel orders if needed.
- **Payment Interface:** Secure online transactions facilitated through Razorpay, ensuring the safety of user payments.
- **Admin Dashboard:** Manage the ecommerce platform efficiently with an intuitive admin dashboard. Dynamic content rendering with HTML and Handlebars for enhanced usability.
  
## UI demo

<p align="center">
    <picture>
    <img alt="thalia" src="./assets/home.png" width=90%>
    </picture>
</p>
<p align="center">
    <picture>
    <img alt="thalia" src="./assets/filter-page.png" width=90%>
    </picture>
</p>

## Tech stack
Main web-frameworks and libraries:
- **Node.js:** Server-side JavaScript execution environment to produce dynamic web pages and service requests.
- **Express.js:** The de facto standard web application framework for Node.js to build web applications including this one.
- **MongoDB(& mongoose.js):** NoSQL database, which serves as the database for this tech stack, for storing and retrieving data(CRUD opreations).
- **Handlebars.js(& Bootstrap):** Templating engine to produce client-side generated dynamic web pages, used to separate UI(view) from logic(model and controller)
- **Payment integration:** Razorpay 
- Sweet Alert, Session, Connect Flash & Validation
- JWT tocken based Authentication
- BCrypt Hashing

Times cart is successfully hosted on render You can access the live site [ecommerce-fullstack-b3nc.onrender.com](https://ecommerce-fullstack-b3nc.onrender.com/).

## How to Host the E-Commerce Website locally on your system

1. Cloning the repository
   
   ```
   git clone https://github.com/SHUHAIB-T/Ecommerce-fullstack.git
   ```
2. go to the cloned directory & install dependancies
   
   ```
   cd Ecommerce-fullstack
   npm install
   ```
3. set up the env file by refering the `.examle.env`
4. Start Node.js server using npm, the server starts processing request at [http://localhost:3000](http://localhost:3000) 
   
   ```
   npm start
   ```

## Contributing

If you're interested in contributing to Times Cart, please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines and instructions.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

