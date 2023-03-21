let express = require('express');
let cors = require('cors');
let app = express();
let port = 3000;
const bodyparser = require('body-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');

const mysql = require('mysql');

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'askthegeeksadmin',
    password: 'askthegeeks@21',
    database: 'askthegeeksdb'
});

conn.connect(function (error) {
    if (error) throw error;

    console.log('Connection Created');
});

app.use(bodyparser.json());
// app.use(bodyparser.urlencoded({ extended: true }));

const corsOptions ={
  origin:'*',
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
}

app.use(cors(corsOptions)) // Use this after the variable declaration


app.use(express.static('views'));
app.use(express.static('public'));
app.use(fileUpload());
app.use(cors());
// app.use(express.json);
app.use(express.urlencoded({extended: false}));



app.post('/update-action', function (req, res) {
    
    console.log(req.body);
    let {fullname, mobile, admintype} = req.body;
    let email = req.body.email;
    console.log(email);

    console.log(mobile);
    console.log(fullname);
    console.log(admintype);


    if (email === "" || fullname === "" || mobile === "" || admintype === "") {
        res.send("required");
    } else {
        let update = "UPDATE `admintable` SET `fullname`='" + fullname + "'," +
            "`mobile`='" + mobile + "', `admintype`='" + admintype + "' WHERE `email`='" + email + "'";
        conn.query(update, function (error) {
            if (error) throw error;

            res.send('User Details Updated Successfully');
        });
    }
});


app.post('/update-password', function (req, res) {
    
    console.log(req.body);
    let {email, password} = req.body;
    // let email = req.body.email;
    // console.log(email);
    
    // console.log(mobile);
    // console.log(fullname);
    // console.log(admintype);


    if (password === "") {
        res.send("required");
    } else {
        let update = "UPDATE `admintable` SET `password`='" + password + "' WHERE `email`='" + email + "'";
        conn.query(update, function (error) {
            if (error) throw error;

            res.send('User Password Updated Successfully');
        });
    }
});


app.get('/delete-email', function (req, res) {
    // console.log(req.query);
    let email = req.query.email;

    let deleteSQL = "DELETE FROM admintable WHERE email='" + email + "'";
    conn.query(deleteSQL, function (err) {
        if (err) throw err;

        res.send('User Deleted');
    });
});

app.get('/delete-category', function (req, res) {
    console.log(req.query);
    let categoryname = req.query.category;

    let deleteSQL = "DELETE FROM category WHERE category_name='" + categoryname + "'";
    conn.query(deleteSQL, function (err) {
        if (err) throw err;

        res.send('Category Deleted');
    });
});

app.get('/get-user-details', function (req, res) {
    let email = req.query.email;

    let selectSQL = "SELECT * FROM `admintable` WHERE email='" + email + "'";
    conn.query(selectSQL, function (err, data) {
        if (err) throw err;
        res.send(data);
        // res.send([]);
    });
});

app.get('/send-data', function (req, res) {
    let selectSQL = "SELECT * FROM `admintable`";

    // conn.query("SELECT * FROM `signup`", function (err, data) {
    conn.query(selectSQL, function (err, data) {
        if (err) throw err;
        res.send(data);
        // res.send([]);
    });
});


app.get('/fetch-category', function (req, res) {
    let selectSQL = "SELECT * FROM `category`";

    // conn.query("SELECT * FROM `signup`", function (err, data) {
    conn.query(selectSQL, function (err, data) {
        if (err) throw err;
        res.send(data);
        // res.send([]);
    });
});

app.get('/view', function (req, res) {
    res.redirect('view.html')
});

app.post('/register-action', function (req, res) {

    let email = req.body.email;

    let select = "SELECT * FROM admintable WHERE email='" + email + "'";
        conn.query(select, function (error, row) {
            if (error) throw error;
            
            let form = req.body;
            if (row.length === 0) {
            let sql = `INSERT INTO admintable(email, password, fullname, mobile, admintype) VALUES ('${form.email}', '${form.password}', '${form.fullname}', '${form.mobile}', '${form.admintype}')`;
            conn.query(sql, (err, result) => {
                if (err) throw err;
                res.send('Post added...');
            });
        } else{
           res.send('duplicate');
        }
  });
});



app.post('/member-register-action', function (req, res) {

    let username = req.body.username;

    let select = "SELECT * FROM members WHERE username='" + username + "'";
    conn.query(select, function (error, row) {
        if (error) throw error;

        let form = req.body;
        if (row.length === 0) {
            let sql = `INSERT INTO members (username,member_name,description,photo,mobile,email,password,ranking) VALUES ('${form.username}', '${form.member_name}', '${form.description}', 'profile.jpg', '${form.mobile}', '${form.email}', '${form.password}', '0');
`;
            conn.query(sql, (err, result) => {
                if (err) throw err;
                res.send('Member added...');
            });
        } else{
            res.send('duplicate');
        }
    });
});

app.post('/add-category', function (req, res) {

    let category = req.body.category;

    let select = "SELECT * FROM category WHERE category_name='" + category + "'";
    conn.query(select, function (error, row) {
        if (error) throw error;

        let form = req.body;
        if (row.length === 0) {
            let sql = `INSERT INTO category(category_name, description) VALUES ('${form.category}', '${form.description}')`;
            conn.query(sql, (err, result) => {
                if (err) throw err;
                res.send('Category added...');
            });
        } else{
            res.send('duplicate');
        }
    });
});

app.post('/login-action', function (req, res) {

    console.log(req.body);

    let {username, password} = req.body;


    let sqlSelect = "SELECT * FROM `members` WHERE username='" + username + "'";
    conn.query(sqlSelect, (err, row) => {
        if (err) throw err;

        console.log(row.length);
        if (row.length > 0) {
            console.log(row[0].password);
            if (row[0].password !== password) {
                res.send('invalidpassword');
            } else {

                session.userID = row[0].username;

                console.log(session.userID);

                res.send('success');
            }
        } else {
            res.send('invalidusername');
        }
    });
});

app.get('/registration-post', function (req, res) {
    res.redirect('registerPOST.html');
});

app.get('/registration', function (req, res) {
    res.redirect('register.html');
});

app.get('/ajax', function (req, res) {
    // res.send('Response from Node Server.');
    res.redirect('ajax.html');
});

app.get('/', function (req, res) {
    // res.send('Response from Node Server.');
    res.redirect('index.html');
});

app.get('/about', function (req, res) {
    res.send('Hello');
});

app.get('/contact', function (req, res) {
    // res.send('Contact Page');
    res.write('Hello');
    res.write('John');
    res.write('How Are You');
    res.end();
});

app.listen(port, function () {
    console.log(`Server Running on http://localhost:${port}`);
    // console.log('Server Running on Port ' + port);
});