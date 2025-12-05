# Skill Up - Interview Preparation Platform

An AI-powered platform for engineers to master Coding, System Design, and Aptitude tests.

## 🚀 Features

- **Modern Landing Page** with animated gradients and smooth transitions
- **Responsive Design** using Bootstrap 5
- **MongoDB Integration** for user data management
- **Express.js Backend** with EJS templating
- **Interactive UI** with JavaScript animations
- **User Authentication** ready signup system

## 📋 Prerequisites

Before running this project, make sure you have installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (v4.4 or higher)
- npm (comes with Node.js)

## 🛠️ Installation

1. **Install Dependencies**
   ```powershell
   npm install
   ```

2. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```powershell
   mongod
   ```
   
   Or if you're using MongoDB as a service, it should already be running.

3. **Configure Environment Variables**
   
   The `.env` file is already created with default values:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/skillup_db
   ```
   
   Modify if needed for your setup.

## 🎯 Running the Application

### Development Mode (with auto-restart)
```powershell
npm run dev
```

### Production Mode
```powershell
npm start
```

The application will be available at: **http://localhost:3000**

## 📁 Project Structure

```
new interview/
├── models/
│   └── User.js              # MongoDB User schema
├── public/
│   ├── css/
│   │   └── style.css        # Custom styles with gradients & animations
│   ├── js/
│   │   └── main.js          # Client-side JavaScript
│   └── images/              # Image assets (add your images here)
├── views/
│   ├── partials/
│   │   ├── header.ejs       # Header with Bootstrap & fonts
│   │   └── footer.ejs       # Footer with scripts
│   └── index.ejs            # Landing page template
├── .env                     # Environment variables
├── .gitignore              # Git ignore file
├── package.json            # Dependencies and scripts
├── server.js               # Express server configuration
└── README.md               # This file
```

## 🎨 Technologies Used

- **Frontend:**
  - HTML5
  - CSS3 (with custom animations and gradients)
  - JavaScript (ES6+)
  - Bootstrap 5.3.2
  - Font Awesome 6.4.2
  - Google Fonts (Inter)

- **Backend:**
  - Node.js
  - Express.js
  - EJS (Embedded JavaScript templates)

- **Database:**
  - MongoDB
  - Mongoose ODM

## 🌟 Features Breakdown

### Landing Page Includes:
- ✅ Animated hero section with gradient text
- ✅ Floating dots background animation
- ✅ Responsive navigation bar
- ✅ Feature highlights (Aptitude, Coding, Interview Prep, Resume Scan)
- ✅ User statistics with animated avatars
- ✅ Sign-up modal form
- ✅ Smooth scroll animations
- ✅ Decorative UI elements (sparkles, grids, frames)

### Backend Features:
- ✅ Express server setup
- ✅ MongoDB connection
- ✅ User model with Mongoose
- ✅ API endpoint for signup
- ✅ EJS template rendering

## 🔧 Customization

### Changing Colors
Edit the CSS variables in `public/css/style.css`:
```css
:root {
  --primary-dark: #0f1624;
  --accent-blue: #5b6ef7;
  --accent-green: #00d9a3;
  /* Add more custom colors */
}
```

### Adding User Avatars
Place avatar images in `public/images/` folder and update the image paths in `views/index.ejs`:
```html
<img src="/images/your-avatar.jpg" alt="User" class="avatar">
```

## 📝 MongoDB Setup

The application will automatically create a database named `skillup_db` when you first run it. To verify:

```powershell
# Open MongoDB shell
mongosh

# Show databases
show dbs

# Use the database
use skillup_db

# Show collections
show collections
```

## 🚀 Deployment Tips

### For Production:
1. Set up environment variables on your hosting platform
2. Use a cloud MongoDB service (MongoDB Atlas)
3. Update MONGODB_URI in `.env` with your cloud database URL
4. Set NODE_ENV to 'production'

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Make sure MongoDB is running: `mongod`
- Check if port 27017 is available
- Verify MONGODB_URI in `.env`

**Port Already in Use:**
- Change PORT in `.env` to another port (e.g., 3001)
- Or kill the process using port 3000

**Dependencies Issues:**
- Delete `node_modules` folder
- Run `npm install` again

## 📄 License

ISC

## 👨‍💻 Author

Created with ❤️ for aspiring engineers

---

**Happy Coding! 🚀**
