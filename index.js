const express = require ('express');

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

const project = []

function getFullTime(time) {

    const date = time.getDate()
    const monthIndex = time.getMonth()
    const year = time.getFullYear()
  
    const hours = time.getHours()
    const minutes = time.getMinutes()
  
  
    return `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`
  }
app.listen(port, function() {
    console.log(`server starting on port ${port} `);
})

app.set('view engine', 'hbs');

app.use('/public', express.static(__dirname+ '/public'));

app.use(express.urlencoded({ extended: false }));

app.get ('/', function (req, res) {
    db.connect(function (err, client, done) {
    const query = 'SELECT * FROM tb_project'; 
        
        client.query(query, function (err, result) {
            if (err) throw err;
            done(); 

            let data = result.rows;
            dataBlogs = data.map((data) => {
                return {
                    ...data,
                }
            });
            
            res.render('home', {
                project: dataBlogs
            });
        });
    });
});


app.get ('/project', function(req, res) {
    res.render('blog')
});

app.get ('/login', function(req, res) {
    res.render('login')
});

app.post('/login', function (req, res) {
    const data = req.body;
  
    if (data.email == '' || data.password == '') {
      req.flash('error', 'Please insert all field!');
      return res.redirect('/login');
    }
  
    db.connect(function (err, client, done) {
      if (err) throw err;
  
      const query = `SELECT * FROM tb_user WHERE email = '${data.email}'`;
  
      client.query(query, function (err, result) {
        if (err) throw err;
  
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
  
        if (isMatch == false) {
          console.log('Wrong Password!');
          return res.redirect('/login');
        }
  
        req.session.isLogin = true;
        req.session.user = {
          id: result.rows[0].id,
          email: result.rows[0].email,
          name: result.rows[0].name,
        };
  
        res.redirect('/blog');
      });
    });
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

app.post('/project', function (req, res) {
    
    db.connect(function (err, client, done) {
        if (err) throw err;

        let title = req.body.title
        let startDate = req.body.startDate
        let endDate = req.body.endDate
        let duration = getDayDifference(startDate,endDate)
        let content = req.body.content
        let android = req.body.android
        let ios = req.body.ios
        let linux = req.body.linux
        let windows = req.body.windows
        let technologies = new Array (android, ios, linux, windows);
        let getLogo =JSON.stringify(technologies.map(logo => `<i value="${logo}"><i>`))
       
        let addProject = {
            title,
            startDate,
            endDate,
            content,
            getLogo,
            duration,
            Image: 'image.jpeg'
        };
        console.log(addProject.getLogo)
        project.push(addProject)
      
       

        const query = `INSERT INTO tb_project 
        (name,start_date,end_date,description,image,technologies,duration)
        VALUES 
        ('${addProject.title}', 
        '${addProject.startDate}', 
        '${addProject.endDate}', 
        '${addProject.content}',
        '${addProject.Image}',
        ARRAY${addProject.getLogo},
        '${addProject.duration}')`
          
        console.log(query)
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

