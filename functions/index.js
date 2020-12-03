const datetime = require('date-and-time');
const functions = require('firebase-functions');
const express = require('express');
const engines = require('consolidate');
var hbs = require('handlebars');
const admin = require('firebase-admin');
var serviceAccount = require("./config.json");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

const app = express();
app.engine('hbs',engines.handlebars);
app.set('views','./views');
app.set('view engine','hbs');

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

//app.use(express.static(__dirname + '/public'));

async function getFirestore(){
    const writeResult = db.collection('AllCarwash').doc('Semarang').get().then(doc => {
    if (!doc.exists) { console.log('No such document!'); }
    else {return doc.data();}})
    .catch(err => { console.log('Error getting document', err);});
    return writeResult
}

app.get('/',async (request,response) =>{
    var db_result = await getFirestore();
    response.render('index',{db_result});
    });

exports.app = functions.https.onRequest(app);

// Read
app.get('/carwash/:location/:idbranch/:idworker', (req, res) => {
    (async () => {
        try {
            //var tanggal = datetime.format(now, 'DD_MM_YYYY');
            //const now = new datetime.Date();
            // var tanggal = date.format(now, 'DD_MM_YYYY');
            // var tanggal = d.getDate();
            // console.log(now)
            // console.log("TANGGALLLLLLLL-----------------------------------")
            // console.log(tanggal)
            var tanggal = "04_12_2020"
            const document = db.collection('allcarwash').doc(req.params.location).collection('Branch').doc(req.params.idbranch).
            collection('Worker').doc(req.params.idworker).collection(tanggal);
            let response = [];
            await document.get().then(querySnapshot => {
                let docs = querySnapshot.docs;
                for (let doc of docs) {
                    const selectedItem = {
                        caswashId: doc.data().caswashId,
                        caswashName: doc.data().caswashName,
                        customerName: doc.data().customerName,
                        customerPhone: doc.data().customerPhone,
                        slot: doc.data().slot,
                        time: doc.data().time,
                        workerId: doc.data().workerId,
                        workerName: doc.data().workerName
                    };
                    response.push(selectedItem);
                }
            });
            return res.status(200).send(response);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Read one carwash
app.get('/carwash/:location/:id', (req, res) => {
    (async () => {
        try {
            const document = db.collection(req.params.location).doc(req.params.id);
            let doc = await document.get();
            let response = {id: doc.data().id,
                            name: doc.data().name,
                            slot:{
                                pertama: doc.data().slot.pertama,
                                kedua: doc.data().slot.kedua,
                                ketiga: doc.data().slot.ketiga,
                                keempat: doc.data().slot.keempat
                            }};
            return res.status(200).send(response);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Post
app.post('/carwash/:location', (req, res) => {
    (async () => {
        try {
            const data = {name: req.body.name,
                            slot:{
                                pertama: req.body.slot.pertama,
                                kedua: req.body.slot.kedua,
                                ketiga: req.body.slot.ketiga,
                                keempat: req.body.slot.keempat
                            }}
            await db.collection(req.params.location).doc('/' + req.body.id + '/')
                .set(data);
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Edit
app.put('/carwash/:location', (req, res) => {
    (async () => {
        try {
            const data = {name: req.body.name,
                slot:{
                    pertama: req.body.slot.pertama,
                    kedua: req.body.slot.kedua,
                    ketiga: req.body.slot.ketiga,
                    keempat: req.body.slot.keempat
                }}
            const document =  db.collection(req.params.location).doc('/' + req.body.id + '/')
            await document.update(data);
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Delete
app.delete('/carwash/:location', (req, res) => {
    (async () => {
        try {
            const document = db.collection(req.params.location).doc('/' + req.body.id + '/');
            await document.delete();
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});
