const express = require ('express');
const bcrypt = require ('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const upload = require('./middlewares/uploadFiles');

// database connect //
const db = require('./connection/db');

db.connect(function (err, _, done) {
  if (err) throw err;
  
  console.log('Database Connection Success');
  done();
});

// database connect //

const app = express();
const port = 5000;

// Boolean => true/false
const isLogin = false;

let project = []

const bulan = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12
]

const month = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'Desember'
  ]
  
 

    app.use(flash());

    app.listen(port, function() {
      console.log(`server starting on port ${port} `);
    })
    app.set('view engine', 'hbs');
    
    
    app.use(
      session({
        secret: 'myFault',
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 1000 * 60 * 60 * 24 },
      })
      );
    
    app.use('/public', express.static(__dirname+ '/public'));
    app.use('/uploads', express.static(__dirname+ '/uploads'));
    app.use(express.urlencoded({ extended: false }));
    

    app.get ('/login', function(req, res) {
      res.render('login')
    });
    
app.post('/login', function (req, res) {
const data = req.body;
console.log('data>>>>>>>>>',data)


db.connect(function (err, client, done) {
  if (err) throw err;
  
  const query = `SELECT * FROM tb_user WHERE email = '${data.email}'`;

  
  client.query(query, function (err, result) {
    if (err) throw err;
    
    if (data.email == ' ' || data.password == ' ') {
      req.flash('error', 'Please insert all field!');
      return res.redirect('/login');
    }

    // Check account by email
    if (result.rows.length == 0) {
      console.log('Email not found!');
      return res.redirect('/login');
    }
    
    // Check password
    const isMatch = bcrypt.compareSync(
      data.password,
      result.rows[0].password
      );
      
      console.log ('password:',  isMatch)
      
      if (isMatch == false) {
        console.log('Wrong Password!');
        return res.redirect('/login');
      }
      
      req.session.isLogin = true;
      req.session.user = {
        id: result.rows[0].id_user,
        email: result.rows[0].email,
        name: result.rows[0].name,
    };
    
    console.log (req.session.user)
    
    res.redirect('/');
  });
});
  });

    app.get ('/', function (req, res) {
      
      console.log('Session isLogin: ', req.session.isLogin);
      console.log('Session user: ', req.session.user);
      
      db.connect(function (err, client, done) {
        let query = ''; 

        if (req.session.isLogin) {
          query = `SELECT tb_project.*, tb_user.id_user, tb_user.email, tb_user.user_name 
                    FROM tb_project
                    LEFT JOIN tb_user ON tb_user.id_user = tb_project.id
                    WHERE tb_user.id_user=${req.session.user.id}`;
        } else {
          query = `SELECT tb_project.*,tb_user.id_user , tb_user.email, tb_user.user_name
                    FROM tb_project 
                    LEFT JOIN tb_user ON tb_user.id_user = tb_project.id`;
        }

        console.log (query)
        
        client.query(query, function (err, result) {
          if (err) throw err;
          done(); 
          
          let data = result.rows;
          dataBlogs = data.map((data) => {
            return {
                    ...data,
                    isLogin: req.session.isLogin,
                  }
            });
            
            res.render('home', {
                project: dataBlogs,
                user : req.session.user,
                isLogin :  req.session.isLogin,
                
              });
            });
          });
        });
        
        
    app.get ('/project', function(req, res) {
          res.render('blog')
        });
      
  
    app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
      });
  
    app.get ('/register', function(req, res) {
      res.render('register')
        });
    
       app.post('/register', function (req, res) {
      const data = req.body;
    
          if (data.name == '' || data.email == '' || data.password == '') {
            req.flash('error', 'Please insert all field!');
            return res.redirect('/register');
          }
          
          const hashedPassword = bcrypt.hashSync(data.password, 10);
        
          db.connect(function (err, client, done) {
            if (err) throw err;
            
            const query = `INSERT INTO tb_user(name,email,password) VALUES ('${data.name}','${data.email}','${hashedPassword}')`;
            
            client.query(query, function (err, result) {
              if (err) throw err;
              
              req.flash('success', 'Success register your account!');
              res.redirect('/login');
            });
          });
        });
  
      app.post('/project', upload.single('image'), function (req, res) {
    
    db.connect(function (err, client, done) {
      if (err) throw err;
      
      let data= req.body
      let android = req.body.android
      let ios = req.body.ios
      let linux = req.body.linux
      let windows = req.body.windows
      // let technologies =  [`
      // <i class="${android}"> </i>, 
      //   <i class="${ios}"> </i>, 
      //   <i class="${linux}"> </i>, 
      //   <i class="${windows}"> </i>`];
        
        let addProject = {
          ...data
        };
        console.log(addProject.getLogo)
        project.push(addProject)
      
        
        
        const query = `INSERT INTO tb_project 
        (name,start_date,end_date,description,image,duration)
        VALUES 
        ('${addProject.title}', 
        '${addProject.startDate}', 
        '${addProject.endDate}', 
        '${addProject.content}',
        '${req.file.filename}',
        '${addProject.duration}')`
        
        console.log(req.file.filename)
        client.query(query, (err, result) => {
          done();
            if (err) throw err;
            res.redirect('/');
          })
    
        });
        
        
      });
      
      
      app.get ('/contact-me', function(req, res) {
        res.render('contact-form')
      });
      
      
      app.get('/blog-detail/:id', function (req, res) {
        let id = req.params.id;
        
        db.connect(function (err, client, done) {
          const query = `SELECT * FROM tb_project WHERE id=${id}`;
          
          
          client.query(query, (err, result) => {
            if (err) throw err;
            done();
            
            let blog = result.rows[0];
            
            blog = {
              ...blog,
            };
            
            res.render ('blog-detail', { addBlog: blog});
          });
          
        });
        
        
      });
      
      
      app.get ('/blog-delete/:id' , (req,res) => {
        let id = req.params.id;

      db.connect(function (err, client , done) {
      const query = `DELETE FROM public.tb_project
      WHERE id= ${id}`;    
      
          client.query(query, function (err, result) {
            if (err) throw err;
                done();
                
                let blog = result.rows[0];
                
                blog = {
                  ...blog,
                };
                
                
              })
              res.redirect ('/')
            })
            
          });
      
       app.get ('/blog-edit/:id', (req,res) => {
        let id = req.params.id;
        
        db.connect(function (err, client, done) {
          const query = `SELECT * FROM tb_project WHERE id=${id}`;
          
          
      client.query(query, (err, result) => {
        if (err) throw err;
        done();

        let blog = result.rows[0];

        blog = {
          ...blog,
        };
        
        res.render ('edit', { addBlog: blog});
      });
  
    });
    
  })
  
  app.post ('/blog-edit/:id' , (req,res) => {
    let id = req.params.id;

    db.connect(function (err, client , done) {
          
      
      client.query(query, function (err, result) {
        if (err) throw err;
          done();
          
          let blog = result.rows[0];
          
          blog = {
            ...blog,
          };

         const query = `UPDATE FROM public.tb_project
        WHERE id= ${id}
        (name,start_date,end_date,description,image,duration)
        VALUES 
        ('${addProject.title}', 
        '${addProject.startDate}', 
        '${addProject.endDate}', 
        '${addProject.content}',
        '${req.file.filename}',
        '${addProject.duration}')`
        
        console.log(req.file.filename)
        client.query(query, (err, result) => {
          done();
            if (err) throw err;
            res.redirect('/');
          });
        });
      });
    });
    
    function getDayDifference(startDate,endDate) {
      const date1 = new Date(startDate) 
      const date2 = new Date(endDate)
      
      const diffTime = Math.abs(date2 - date1);
      console.log(diffTime)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      console.log(diffDays)
      
      
      if (diffDays < 30) {
        
        return diffDays + ` days`
        
      } else if (diffDays == 30) {
        
        let diffMonth = Math.ceil (diffTime / (1000 * 60 * 60 * 24 * 30));
        return diffMonth + ' month'
        
      } else if (diffDays >=30 ) {
        
        let diffMonths = Math.floor (diffTime / (1000 * 60 * 60 * 24 * 30));
        var sisa = bulan.find (function (b) { 
          return b == diffMonths
        })
        const pengurangan = Math.abs(sisa * 30 - diffDays); 
        diffMonths = sisa;
        
        if ( pengurangan > 1) {
             
              return diffMonths + ` month ` + pengurangan +  ` days`
            } else if (pengurangan == 1) {
              return diffMonths + ` month ` + pengurangan +  ` day`
            }
            
          }  
          
        }
        
        
  function getFullTime(time) {
          
          const date = time.getDate()
          const monthIndex = time.getMonth()
          const year = time.getFullYear()
          
          const hours = time.getHours()
          const minutes = time.getMinutes()
          
    
    return `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`
  }
  
  