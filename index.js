const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const {getFirestore, collection, setDoc, getDoc, doc, getDocs, updateDoc, deleteDoc} = require('firebase/firestore')
const {initializeApp} = require('firebase/app');
const { response } = require('express');
const path = require('path');

//Inicio de uso de firebase
require('dotenv/config')

//Configuracion de firebase
const firebaseConfig = {
    apiKey: "AIzaSyAi7f_78amdz5yIdKQhsQA0bJ4ziIFgLqQ",
    authDomain: "lmp-dicis.firebaseapp.com",
    projectId: "lmp-dicis",
    storageBucket: "lmp-dicis.appspot.com",
    messagingSenderId: "835381573602",
    appId: "1:835381573602:web:1a4fe0510cac90829aabbb"
};

//Inicio de la base de datos de firebase
const firebase = initializeApp(firebaseConfig);
const db = getFirestore()

//Servidor
const app = express();

//opciones de cors
const corsOptions = {
    "origin": "*",
    "optionSuccessStatus": 200
}

//Configuracion del servidor
app.use(express.json());
app.use(cors(corsOptions));

//Rutas
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'))
})
app.get('/principal', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'entro.html'))
})
//Insertar registro
app.post('/insertar', (req, res) => {
    const {name, lastname, email, password, number} = req.body

    if(!name || !lastname || !email || !password || !number) {
        res.json({
            'alert': 'Faltan datos'
        })
        return
    }

    //Validaciones
    if(name.length < 2){
        res.json({
            'alert': 'Nombre minimo de 2 caracteres'
        })
    }
    else if(lastname.length < 2){
        res.json({
            'alert': 'Apellidos minimo de 2 caracteres'
        })
    }
    else if(!email.length)
    {
        res.json({
            'alert': 'Debe de ingresar el email'
        })
    }
    else if(password.length < 8)
    {
        res.json({
            'alert': 'Constraseña debe de ser minimo 8 caracteres'
        })
    }
    else if(!Number(number) || !number.length === 10)
    {
        res.json({
            'alert': 'Introduce un numero valido'
        })
    }
    else
    {
        const alumnos = collection(db,"alumnos")
        getDoc(doc(alumnos,email)).then(alumno => {
            if(alumno.exists()){
                res.json({
                    'alert': 'Correo en uso'
                })
            }
            else
            {
                bcrypt.genSalt(10,(err,salt) => {
                    bcrypt.hash(password, salt, (err,hash) => {
                        sndData = {
                            name,
                            lastname,
                            email,
                            password: hash,
                            number
                        }
                        //Guardarlo en la base de datos
                        setDoc(doc(alumnos,email),sndData).then(() => {
                            res.json({
                                'alert' : 'Success...'
                            })
                        }).catch((e) => {
                            res.json({
                                'alert' : e
                            })
                        })
                    })
                })
            }
        })
    }
})

//Ingresar
app.post('/login', (req, res) => {
    const {email, password} = req.body
    if(!email || !password) 
    {
        res.json({
            'alert': "Faltan datos"
        })
    }
    else
    {
        const alumnos = collection(db, 'alumnos')
        getDoc(doc(alumnos,email))
        .then((alumno) => {
            if(!alumno.exists())
            {
                res.json({
                    'alert' : 'Correo no registrado'
                })
            }
            else
            {
                bcrypt.compare(password, alumno.data().password, (error, result) => {
                    if(result)
                    {
                        //Para regrrsar datos
                        let data = alumno.data()
                        
                        res.json({
                            'alert' : `Success ... Bienvenido ${data.name}`,
                            name : data.name,
                            lastname : data.lastname,
                            data
                        })
                        
                    }
                    else
                    {
                        res.json({
                            'alert' : 'Contraseña incorrecta'
                        })
                    }
                })
            }
        })
    }
})

//Obtener de DB
app.get('/todo',async (req, res) =>{
    const alumnos = collection(db, "alumnos")//Obtenciaon de datos 
    const arrgl = await getDocs(alumnos)
    let rtnData =  [] //Lo que se le mostrara al usuario
    arrgl.forEach(alumno => {
        rtnData.push(alumno.data())
    })
    //Enviar todos los datos de la base de datos
    res.json({
        'alert' : 'Success...',
        'data' : rtnData
    })
})

//Eliminar
app.post('/eliminar', (req, res) =>{
    const {email} = req.body
    /*let alumnoEli = db.collection('alumnos').where('email', '==', email)//Encontrar registro
    alumnoEli.get().then((item) => {
        item.forEach((doc) => {
            doc.ref.delete()
        })
    })*/
    deleteDoc(doc(db,'alumnos',email)).then((elim) => {
        if(!elim)
        {
            res.json({
                'alert' : 'Alumno eliminado'
            })
        }
        else
        {
            res.json({
                'alert' : 'No se pudo eliminar'
            })
        }
    })
})

//Actualizar
app.post('/actualizar', (req, res) =>{
    const {name, lastname, email, number} = req.body
    
    //Que se envie algo
    if(!name || !lastname || !email || !number) {
        res.json({
            'alert': 'Faltan datos'
        })
        return
    }
    /*const alumnos = collection(db,"alumnos")
    getDoc(doc(alumnos,email)).then(alumno => {
        if(alumno.exists()){
            res.json({
                'alert': 'Correo en uso'
            })
        }
    })*/

    //Validaciones
    if(name.length < 2){
        res.json({
            'alert': 'Nombre minimo de 2 caracteres'
        })
    }
    else if(lastname.length < 2){
        res.json({
            'alert': 'Apellidos minimo de 2 caracteres'
        })
    }
    else if(!email.length)
    {
        res.json({
            'alert': 'Debe de ingresar el email'
        })
    }
    else if(!Number(number) || !number.length === 10)
    {
        res.json({
            'alert': 'Introduce un numero valido'
        })
    }
    else
    {
        //Obtener el documento, registro, del usuario
        //db.collection('alumnos').doc(email)//Busqueda del registro a modificar
        //Datos que se modificaran
        const dataUpdate = {
            name,
            lastname,
            number
        }
        updateDoc(doc(db,"alumnos",email),dataUpdate)//Base de datos a modificar, datos nuevos, "primary key"
        .then((response) => {
            res.json({
                'alert' : `Registro modificado: ${email}`
            })
        })
        .catch((e) => {
            res.json({
                'alert' : e
            })
        })
    }
})

//Puerto de escucha
const PORTO = process.env.PORT || 11235
//Arrancar el servidor
app.listen(PORTO, () =>{
    console.log(`Escuchando en puerto ${PORTO}`)
})