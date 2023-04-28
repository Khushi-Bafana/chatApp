import React, { useEffect, useRef, useState } from 'react';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

//This will be a single file application so i wont be reusing compnenets
//So i will load everything in this file
firebase.initializeApp({
    apiKey: "AIzaSyD1miv5nPCHtDXOA0vIXWgQE-NPFgmOTlg",
    authDomain: "gantzchatserver.firebaseapp.com",
    projectId: "gantzchatserver",
    storageBucket: "gantzchatserver.appspot.com",
    messagingSenderId: "25585306690",
    appId: "1:25585306690:web:2651a58343e93a00aff1db",
    measurementId: "G-JTZJV1C03D"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
    const [user] = useAuthState(auth);

    return (
        <div>
            <SignOut />
            <section>
                { user ? <ChatRoom /> : <SignIn /> }
            </section>
        </div>
    );
}

function SignIn() {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    }
    return (
        <div>
            <button onClick = { signInWithGoogle }>Sign In With Google</button>
        </div>
    )
}

function SignOut() {
    return auth.currentUser && (
        <div>
            <button onClick = { () => auth.signOut() }>Sign Out</button>
        </div>
    )
}

function ChatRoom() {
    const dumbSc = useRef();
    const messagesRef = firestore.collection('messages');
    const query = messagesRef.orderBy('createdAt', 'asc').limitToLast(25);

    const [messages] = useCollectionData(query, { idField: 'id' });
    const [formValue, setFormValue] = useState('');

    const scrollToBottom = () => {
        dumbSc.current.scrollIntoView({ behavior: 'smooth' });
    }

    useEffect(scrollToBottom, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();

        const { displayName, uid, photoURL } = auth.currentUser;

        await messagesRef.add({
            user: displayName,
            body: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid: uid,
            photoURL: photoURL
        })

        setFormValue('');
        dumbSc.current.scrollIntoView({ behavior: 'smooth' });
    }

    return (
        <div>
            <div>
                { messages && messages.map(msg => <ChatMessage key = { msg.id } message = { msg } />) }
                <span ref = { dumbSc }></span>
            </div>
            <form onSubmit = { sendMessage }>
                <input value = { formValue } onChange = { (e) => setFormValue(e.target.value) } placeholder="Message here!!!!" />
                <button type = "submit" disabled = { !formValue }>send</button>
            </form>
        </div>
    )
}

function ChatMessage(props) {
    const { user, body, uid, photoURL, createdAt } = props.message;
    
    return (
        <div>
            <div>
                <img src = { photoURL || 'https://i.imgur.com/rFbS5ms.png' } alt = "{ user }'s pfp" />
            </div>
            <div>
                <p>{ user }</p>
                <p>{ body }</p>
            </div>
        </div>
    )
}

export default App;
