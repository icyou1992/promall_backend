import * as functions from "firebase-functions";
import { initializeApp } from '@firebase/app'
// import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { addDoc, collection, getDocs, getFirestore, Timestamp, query, where, doc, updateDoc } from '@firebase/firestore'
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, } from '@firebase/auth'

const firebaseConfig = {
  // apiKey: 'AIzaSyCqd2HUGGh2hKz22EtDrYK4kBqIWXTdnhk',
  // authDomain: 'promo-332311.firebaseapp.com',
  // projectId: 'promo-332311',
  // storageBucket: 'promo-332311.appspot.com',
  // messagingSenderId: '184089826977',
  // appId: '1:184089826977:web:a6d897f4cf8c42a57202e0',
  // mesurementId: 'G-K3P00SK7EN',
  apiKey: functions.config().env.firebase.api_key,
  authDomain: functions.config().env.firebase.auth_domain,
  projectId: functions.config().env.firebase.project_id,
  storageBucket: functions.config().env.firebase.storage_bucket,
  messagingSenderId: functions.config().env.firebase.messaging_sender_id,
  appId: functions.config().env.firebase.app_id,
  mesurementId: functions.config().env.firebase.measurement_id,
}
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


const promotionAPI = functions.region('asia-northeast3').https.onRequest(async (req: any, res: any) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Origin, Accept, X-Requested-With, Content-Type');
  
  const toCustomDate = (date: Timestamp) => {
    return date.toDate().toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  switch(req.method) {
    case 'OPTIONS':
      res.end();
      break;
    case 'GET':
      try {
        let docs: any = [];

        if('category' in req.query) {
          const querySnapshot = await getDocs(query(collection(db, 'promotion'), where('category', '==', req.query.category), where('expirationDate', '>=', Timestamp.now())));
          
          querySnapshot.forEach(doc => {
            const data = doc.data();
            data.effectiveDate = toCustomDate(data.effectiveDate);
            data.expirationDate = toCustomDate(data.expirationDate);
            
            docs.push(data);
          })
        } else if('keyword' in req.query) {
          // const querySnapshot = await getDocs(query(collection(db, 'promotion'), orderBy('expirationDate'), where('expirationDate', '>=', Timestamp.now()), where('title', 'in', req.query.search)));
          // const querySnapshot2 = await getDocs(query(collection(db, 'promotion'), orderBy('expirationDate'), where('expirationDate', '>=', Timestamp.now()), where('description', 'in', req.query.search)));
          
        } else {
          const querySnapshot = await getDocs(query(collection(db, 'promotion'), where('expirationDate', '>=', Timestamp.now())));
          
          querySnapshot.forEach(doc => {
            const data = doc.data();
            data.effectiveDate = toCustomDate(data.effectiveDate);
            data.expirationDate = toCustomDate(data.expirationDate);
            console.log(doc.id);
            docs.push(data);            
          })
          
        }
        res.status(200).json(docs);
      } catch(err) {
        console.log(err);
      } 
      break;
    case 'PUT':
      break;  
    case 'POST':
      try {
        console.log(req.body)
        // const setDoc = await db.collection('promotion').add(req.body)
        const querySnapshot = await addDoc(collection(db, 'promotion'), req.body)

        res.status(200).json(querySnapshot.id)
      } catch(err) {
        console.log(err);
      }
      break;
    case 'DELETE':

      break;
    case 'PATCH':
      try {
        const docRef = doc(db, req.query.id)
        const documentSnapshot = await updateDoc(docRef, Object.keys(req.query)[1], req.query[Object.keys(req.query)[1]])

        res.status(200).json(documentSnapshot)
      } catch(err) {
        console.log(err);
      }
      break;
    default:
      res.status(405).send({ error: req, res })
  }
});

// const promotionDataAPI = functions.region('asia-northeast3').https.onRequest(async (req: any, res: any) => {
//   res.set('Access-Control-Allow-Origin', '*');
//   res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH, OPTIONS');
//   res.set('Access-Control-Allow-Headers', 'Origin, Accept, X-Requested-With, Content-Type');
  

// });

const userAPI = functions.region('asia-northeast3').https.onRequest(async (req: any, res: any) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Origin, Accept, X-Requested-With, Content-Type');
  const auth = getAuth(app)
  
  switch(req.method) {
    case 'OPTIONS':
      res.end();
      break;
    case 'GET':
      try {
        // const user = auth.currentUser
        onAuthStateChanged(auth, user => {
          if(user) return res.status(200).json(user)
          else return res.status(400).json('Cant get auth')          
        })        
      } catch(err) {
        console.log(err);
      }
      break;
    case 'POST':
      try {
        createUserWithEmailAndPassword(auth, req.body.email, req.body.password).then(userCredential => {
          return res.status(200).json(userCredential.user)
        })
      } catch(err) {
        console.log(err);
      }
      break;
    case 'PATCH':
      // try {
      //   switch(req.query.keys()[0]) {
      //     case 'email':

      //       break;
      //     default:

      //   }
      // } catch(err) {
      //   console.log(err);
      // }
      break;
    default: 
      res.status(405).send({ error: req, res })
  }
});

export { 
  promotionAPI, 
  userAPI, 
}