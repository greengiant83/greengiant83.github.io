// Initialize Firebase
var config = {
	apiKey: "AIzaSyBUkR7JAuLIZbTzZhFEJXV4B-WpRb8GR2A",
	authDomain: "music-machine-fa546.firebaseapp.com",
	databaseURL: "https://music-machine-fa546.firebaseio.com",
	projectId: "music-machine-fa546",
	storageBucket: "music-machine-fa546.appspot.com",
	messagingSenderId: "281401274515"
};
firebase.initializeApp(config);
var db = firebase.database();

firebase.auth().signInAnonymously();