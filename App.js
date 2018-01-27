import React, { Component } from 'react';
import { Clipboard, Keyboard, KeyboardAvoidingView, RefreshControl, Alert, StyleSheet, Text, View, Image, TextInput, ScrollView, TouchableWithoutFeedback, Button, FlatList,TouchableHighlight, } from 'react-native';
import { Font,Constants,WebBrowser,ImagePicker } from 'expo';
import * as firebase from 'firebase';
import { StackNavigator, TabNavigator } from 'react-navigation';
import { brightColor, darkColor, animalNames,expoID,expoNameIDConst,dislikeColor,likeColor,icons } from './names.js'
//import { counter, increment,zero,returnCounter } from './global.js';
const firebaseConfig = {
  apiKey: "API-key",
  authDomain: "candidtwo.firebaseapp.com",
  databaseURL: "https://candidtwo.firebaseio.com",
  storageBucket: "candidtwo.appspot.com",
};
const firebaseApp = firebase.initializeApp(firebaseConfig);
const Dimensions = require('Dimensions');
const iWidth = Dimensions.get('window').width - 10;
const iHeight = iWidth * (4/3)
var ref = firebase.database().ref('posts');
var newPostRef = ref.push();
         
var postWidth = 360;
class FeedView extends React.Component {
 
 static navigationOptions = {
    header:null,
    tabBarVisible:false,
    tabBarIcon: () => (
      <Image
        source={require('./CandidtwoImages/feedtab.png')}
        style={[styles.icon, {tintColor: '#A9A9A9'}]}
      />
    ),
  };
  state = {
    fontLoaded: false,
  };
 
  async componentDidMount() {
    await Font.loadAsync({
      'JosefinSans-Regular.ttf': require('./JosefinSans-Regular.ttf'),
    });
  }
 
  constructor(props) {
    super(props);
    this.state = {
    postInput: "",
    refreshing: false,
    numOfPosts: 1,
    passGroups:[' '],
    firebaseItems: [],
    totalGroups: 1,
    indexOfGroups:0,
    }
 }
  componentWillMount(){
   this.getItems();
 }
runQ(group,indexi,total){
firebase.database().ref('posts/'+group+'/posts').limitToLast(
          (Math.floor(40/this.state.passGroups.length)*this.state.numOfPosts)+2
    ).orderByKey().once ('value', (snap) => {
      snap.forEach ( (child) => {       
       this.state.firebaseItems.push({
         content: child.val().content,
         key: child.key,
         nameID: child.val().userNameId,
         userID: child.val().userID,
         commentPreview: child.val().newestComment,
     comments: child.val().comments,
     likes: child.val().likes,
     dislikes: child.val().dislikes,
     group: child.val().group,
     time: child.val().time,
     image: child.val().image,
     imageW: child.val().imageW,
     imageH: child.val().imageH,
     timeStamp: '',
     });
     });
	this.setState({
		totalGroups:total,
		indexOfGroups:indexi,
	})
    var items = this.state.firebaseItems;
    items.sort(function(a, b) {return b.time - a.time});
this.setState({firebaseItems: [{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'AMA',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     }]
    })
 for (i = 0; i < items.length; i++) {
        var timeStamp = 'error';
    var secondsBtwn = Math.floor((Date.now() - items[i].time)/1000);
    if (secondsBtwn > 31536000){
          timeStamp = Math.floor(secondsBtwn/31536000) + 'y';
        }else if (secondsBtwn >= 604800){
        timeStamp = Math.floor(secondsBtwn/604800) + 'w';
    }else if (secondsBtwn >= 86400){
        timeStamp = Math.floor(secondsBtwn/86400) + 'd';
    }else if (secondsBtwn >= 3600){
        timeStamp = Math.floor(secondsBtwn/3600) + 'h';
    }else if (secondsBtwn >= 60){
        timeStamp = Math.floor(secondsBtwn/60) + 'm';
    }else{
        timeStamp = Math.floor(secondsBtwn) + 's';
    }
items[i].timeStamp = timeStamp;
}
            this.setState({firebaseItems:items})
	    if (indexi == total-1){this.setState({fontLoaded:true})}
})
}
  getItems(){
this.setState({fontLoaded: false})
    this.setState({firebaseItems: []})
    var groups = [];
var gq = firebase.database().ref('users/'+expoID+'/groups').orderByKey();
    gq.once ('value', (snap) => {
      snap.forEach ( (child) => {       
       groups.push({
         name: child.val().name,
     });
     });
this.setState({passGroups: groups})
if (this.state.passGroups.length == 0){
 Alert.alert("You are not in any groups. Go to the groups tab and join some.");
 this.setState({fontLoaded: true})
}
}).then(() => {
      var allItems = [];
      for (i = 0; i < this.state.passGroups.length; i++) {
        this.runQ(this.state.passGroups[i].name,i,this.state.passGroups.length)
      }
      this.setState({refreshing:false})
    })
}
  _onRefresh() {
    this.setState({refreshing: true});
    this.getItems()
  }
pressLike(key,likes,dislikes,group){
    var usersLiked = [];
    var query = firebase.database().ref('posts/'+group+'/posts/'+key+'/usersVoted').orderByKey();
    query.once ('value', (snap) => {
      snap.forEach ( (child) => {       
       usersLiked.push({
         expoID:child.val().expoID
     });
     })
     }).then(() => {
      var addUserID = true;
             for (i = 0; i < usersLiked.length; i++) {
                if (usersLiked[i].expoID == expoID){
             var addUserID = false;
    }
    }
if (addUserID == true){
    firebase.database().ref('posts/'+group+'/posts/'+key+'/votes/'+expoID).update({ voteNum: '0' })
    firebase.database().ref('posts/'+group+'/posts/'+key+'/usersVoted').push().set({ expoID:expoID })
}
}).then(() =>{
firebase.database().ref('posts/'+group+'/posts/'+key+'/votes/'+expoID).once("value", dataSnapshot => {
 voteNum=dataSnapshot.val().voteNum
}).then(() =>{
if (voteNum == 0){
   firebase.database().ref('posts/'+group+'/posts/'+key).update({ likes: likes + 1 });
   firebase.database().ref('posts/'+group+'/posts/'+key+'/votes/'+expoID).update({ voteNum: '2' });
   this.updateVotes(key,'l')
  }
})
  })
}
pressDislike(key,likes,dislikes,group){
       var usersLiked = [];
    var query = firebase.database().ref('posts/'+group+'/posts/'+key+'/usersVoted').orderByKey();
    query.once ('value', (snap) => {
      snap.forEach ( (child) => {       
       usersLiked.push({
         expoID:child.val().expoID
     });
     })
     }).then(() => {
      var addUserID = true;
             for (i = 0; i < usersLiked.length; i++) {
                if (usersLiked[i].expoID == expoID){
             var addUserID = false;
    }
    }
if (addUserID == true){
    firebase.database().ref('posts/'+group+'/posts/'+key+'/votes/'+expoID).update({ voteNum: '0' })
    firebase.database().ref('posts/'+group+'/posts/'+key+'/usersVoted').push().set({ expoID:expoID })
}
}).then(() =>{
firebase.database().ref('posts/'+group+'/posts/'+key+'/votes/'+expoID).once("value", dataSnapshot => {
 voteNum=dataSnapshot.val().voteNum
}).then(() =>{
if (voteNum == 0){
   firebase.database().ref('posts/'+group+'/posts/'+key).update({ dislikes:dislikes + 1 });
   firebase.database().ref('posts/'+group+'/posts/'+key+'/votes/'+expoID).update({ voteNum: '1' });
   this.updateVotes(key,'d');
  }     
})
  })
}
updateVotes(key,vote){
var items = this.state.firebaseItems;
   for (i = 0; i < items.length; i++) {
     if (items[i].key == key){
         if (vote == 'd'){
    var passNum = items[i].dislikes+1;
    items[i].dislikes = passNum;
    break;
    }else{
    var passNum = items[i].likes+1;
    items[i].likes = passNum
    break;
    }
     }
   }
    this.setState({firebaseItems: [{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'AMA',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     }]
   })
    this.setState({firebaseItems: items})
}
 render() {
    return (
      <View style={styles.container}>
        {this.state.fontLoaded == false &&
	  <View style={{backgroundColor:'#fe8200',width:2500,height:2500,alignItems:'center',justifyContent:'center'}}>
            <Image style={{height:80,width:80,tintColor:'white'}} source={require('./CandidtwoImages/Phoenixlogonobackground.png')} />
	    <View style={{height:10}}/>
<Text style={{
        fontSize: 24,
        color: 'white',
	fontWeight:'bold',
          }}>
            Phoenix
          </Text>
	    <View style={{height:30}}/>
	    <View style={{width: iWidth-100,height:20,borderRadius:20/2,backgroundColor:'#ffc800'}}>
<View style={{width: (this.state.indexOfGroups/this.state.totalGroups)*iWidth-100, borderRadius: 20/2, height: 20, backgroundColor: '#ff0037',}}/>
</View>
	  </View>
	}
        {this.state.fontLoaded ? (
          <View style={styles.container}>
                    
            <ScrollView   
     refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />
        }
ref='_scrollView'>
      <View style={{paddingLeft: 5, paddingRight:5}}>
    <View style={{width: 1, height: 30, backgroundColor: '#e8e8e8'}} />
     <FlatList
        data = {this.state.firebaseItems}
    renderItem={({ item, index }) =>
     <View>

{item.likes > 4 &&
<View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
<Text style={{
        fontSize: 15,
        color: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))],
          }}>
            Trending
          </Text>
            <Image style={{height:15,width:15,tintColor:darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}} source={require('./CandidtwoImages/trending.png')} />
</View>
}
                <View style={{width: 1, height: 2, backgroundColor: '#e8e8e8'}} />
    <View elevation={2} style={{width: parseInt(this.state.postWidth), height: 35, backgroundColor: brightColor[Math.floor((item.content.length/10)+(item.nameID * 2))], borderTopLeftRadius: 7, borderTopRightRadius: 7, paddingTop:5,paddingLeft:5,flexDirection:'row',justifyContent: 'space-between',shadowOpacity:0.5,shadowRadius:1
}}>
<View style={{
    width: 24,
    height: 24,
    borderRadius: 24/2,
    backgroundColor: '#FFFFFFa9',
}}>
                    <Image style={{height:27,width:27,tintColor:darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}} source={icons[Math.floor((item.content.length/10)+(item.nameID * 2))]} />
</View>
                    <Text style={{ fontWeight:'bold',fontSize: 17,color: '#ffffff'}}>
                        { animalNames[Math.floor((item.content.length/10)+(item.nameID * 2))] }
                    </Text>
    <View style={{width: 2, height: 1, backgroundColor: brightColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
    <View style={{width: 2, height: 1, backgroundColor: brightColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
    <View style={{width: 2, height: 1, backgroundColor: brightColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
<View style={{width: this.state.postWidth, height: 20,flexDirection:'row'}}>
<Text style={{
            fontSize: 15,
            color: '#ffffff',
        backgroundColor: '#fe8200',
            textAlign: 'left',
    fontWeight: 'bold',
        borderRadius: 5
          }}>
            {expoID == item.userID ? "YOU" : ""}
          </Text>
    <View style={{width: 8, height: 1, backgroundColor: brightColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
<Text style={{
        fontSize: 15,
        color: '#ffffff',
        backgroundColor: '#fe8200',
        textAlign: 'left',
        borderRadius: 5,
    fontWeight: 'bold'
          }}>
            {Math.floor(item.content.length/30)+1}
          </Text>
    <View style={{width: 8, height: 1, backgroundColor: brightColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
 <TouchableWithoutFeedback onPress={() => { this.props.navigation.navigate('groupView',{group:item.group})}}>
<Text style={{
        fontSize: 15,
        color: brightColor[Math.floor((item.content.length/10)+(item.nameID * 2))],
        backgroundColor: '#ffffff',
        textAlign: 'left',
        borderRadius: 14,
    fontWeight: 'bold'
          }}>
            {' '+item.group+' '}
          </Text>
</TouchableWithoutFeedback>
    <View style={{width: 8, height: 1, backgroundColor: brightColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
</View>
        </View>
<View elevation={2} style={{height:15,width:this.state.postWidth,paddingRight:5, backgroundColor: brightColor[Math.floor((item.content.length/10)+(item.nameID * 2))],flexDirection:'row'}}>
<View style={{width:6,height:1}}/>
  <Text style={{
        fontSize: 12,
        color: '#f4f4f4',
          }}>
            {item.timeStamp}
          </Text>
</View>
                <TouchableWithoutFeedback onPress={() => { this.props.navigation.navigate('CommentScreen',{postKey: item.key, postContent: item.content, passNameID: item.nameID, userID: item.userID,group:item.group})}}>
        <View elevation={2} style={{width: parseInt(this.state.postWidth), height: this.state.postWidth, backgroundColor: brightColor[Math.floor((item.content.length/10)+(item.nameID * 2))],  alignItems: 'center', justifyContent: 'center', paddingLeft: 12, paddingRight:12,paddingTop:35,paddingBottom:60}}>
            <Text style={{ fontFamily: 'JosefinSans-Regular.ttf', fontSize: 22, color: '#ffffff', textAlign: 'center'}} numberOfLines={7}>
                        { item.content }
                   </Text>
      {item.image.length != 1 &&
    <View style={{ paddingTop:15}}>
    <Image style={{width:iWidth, height: (iWidth*item.imageH)/item.imageW}} source={{uri: 'data:image/png;base64,'+item.image}}/>
    </View>
      }
        </View>
                </TouchableWithoutFeedback>
    
              
<View elevation={2} style={{width: parseInt(this.state.postWidth), height: 40, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))], flexDirection: 'row',paddingLeft:5,justifyContent:'space-between'}}>
 
 <TouchableHighlight onPress={() => {
         this.pressLike(item.key,item.likes,item.dislikes,item.group);
        }}>
<Image style={{height:39,width:39,tintColor:'white'}} source={require('./CandidtwoImages/unlove.png')} />
                </TouchableHighlight>
            <Text style={{ fontFamily: 'JosefinSans-Regular.ttf',  fontSize: 20, color: '#ffffff',paddingTop:5}}>
                         { item.likes }
                    </Text>
    <View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
    <View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
 <TouchableHighlight onPress={() => {
          this.pressDislike(item.key,item.likes,item.dislikes,item.group);
        }}>
            <Image style={{height:39,width:39,tintColor:'white'}} source={require('./CandidtwoImages/undislike.png')} />
                </TouchableHighlight>
            <Text style={{ fontFamily: 'JosefinSans-Regular.ttf', fontSize: 20, color: '#ffffff',paddingTop:5}}>
                        { item.dislikes }
                    </Text>
     <View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
    <View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
 <TouchableWithoutFeedback onPress={() => { this.props.navigation.navigate('CommentScreen',{postKey: item.key, postContent: item.content, passNameID: item.nameID, userID: item.userID,group:item.group})}}>
    <Image style={{height:39,width:39}} source={require('./CandidtwoImages/comments.png')}/>
</TouchableWithoutFeedback>
     <Text style={{ fontFamily: 'JosefinSans-Regular.ttf',  fontSize: 20, color: '#ffffff',paddingTop:5}}>
                        { item.comments }
                   </Text>
 <View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
    <View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
        <TouchableWithoutFeedback onPress={() => {
    if (item.userID
 == expoID){Alert.alert("Error: you can not send a direct message to yourself.")} else { this.props.navigation.navigate('Chat',{postKey: item.key, userID:item.userID, name: animalNames[Math.floor((item.content.length/10)+item.nameID*2)], opl: item.content.length,nameID:item.nameID,group:item.group})  }}}>
        <Image style={{width:34,height:36,tintColor:'white'}}source={require('./CandidtwoImages/mail.png')}/>
    </TouchableWithoutFeedback>
 <View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
    <View style={{width: 9, height: 1, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
    <TouchableWithoutFeedback onPress={() => { Clipboard.setString(item.content); Alert.alert('Copied text');}}>
        <Image style={{width:34,height:33,tintColor:'white'}}source={require('./CandidtwoImages/copytext.png')}/>
    </TouchableWithoutFeedback>
 <View style={{width: 3, height: 1, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
    </View>
  <View elevation={2} style={{width: parseInt(this.state.postWidth), height: this.state.postWidth, borderBottomLeftRadius: 7, borderBottomRightRadius: 7, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))], paddingLeft:10, paddingRight:10}}>
 <View style={{width: 1, height: 4, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
{item.commentPreview.length != 1 &&
    <TouchableWithoutFeedback onPress={() => { this.props.navigation.navigate('CommentScreen',{postKey: item.key, postContent: item.content, passNameID: item.nameID, userID: item.userID,group:item.group})}}>
    <View style={{paddingBottom:5}}>
  <Text style={{fontSize: 16, fontWeight:'bold', color: '#ffffff', textAlign: 'left'}}>
                        Read all {item.comments} comment{item.comments == 1 ? "" : "s"}
                    </Text>
                  <Text style={{fontSize: 15, color: '#ffffff', textAlign: 'left'}} numberOfLines={1}>
                        { item.commentPreview }
                    </Text>
    </View>
</TouchableWithoutFeedback>
      }
    </View>
                <View style={{width: 1, height: 4, backgroundColor: '#e8e8e8'}} />
            </View>
  }
    />
<View style={{height:200,width:iWidth,color:'e8e8e8'}}/>
</View>
<View style={{height:0,width:0}}>
<Text>
If you ever add back tap to load more posts, then add 1 to numofposts. It multiplies above.
</Text>
</View>
               
        </ScrollView>
<View>
         <View style={{width: this.state.postWidth, height: 50, backgroundColor: '#f9f9f9',alignItems:'center',justifyContent:'space-between',flexDirection:'row'}}>
<TouchableHighlight onPress={() => {this.refs._scrollView.scrollTo({x: 0, y: 0, animated: true});}}>
<View style={{ height:50,width:50,backgroundColor:'white',alignItems:'center'}}>
        <Image style={{width:27,height:27,tintColor:'#fe8200'}}source={require('./CandidtwoImages/feedtab.png')}/>
 <Text style={{ fontSize: 14,color:'black' }}>
               Feed
            </Text>
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Groups')}}>
<View style={{ height:50,width:50,backgroundColor:'#f9f9f9',alignItems:'center'}}>
        <Image style={{width:25,height:25,tintColor:'#929292'}}source={require('./CandidtwoImages/starTab.png')}/>
 <Text style={{ fontSize: 12,color:'#929292' }}>
               Groups
            </Text>
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Post')}}>
<View elevation={2} style={{borderRadius:50/2, height:50,width:50,backgroundColor:'white',alignItems:'center',shadowOpacity:0.5,shadowRadius:2}}>
        <Image style={{width:26,height:26,tintColor:'#2d2d2d'}}source={require('./CandidtwoImages/plus.png')}/>
 <Text style={{ fontSize: 15,color:'#2d2d2d',fontWeight:'bold' }}>
                Post
            </Text>
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Chats')}}>
<View style={{ height:50,width:50,backgroundColor:'#f9f9f9',alignItems:'center'}}>
        <Image style={{width:24,height:26,tintColor:'#929292'}}source={require('./CandidtwoImages/mail.png')}/>
 <Text style={{ fontSize: 12,color:'#929292' }}>
               Chats
            </Text>
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Notifs')}}>
<View style={{ height:50,width:50,backgroundColor:'#f9f9f9',alignItems:'center'}}>
        <Image style={{width:25,height:25,tintColor:'#929292'}}source={require('./CandidtwoImages/NotificationIcon.png')}/>
 <Text style={{ fontSize: 12,color:'#929292' }}>
You
            </Text>
</View>  
</TouchableHighlight>
</View>
 <View style={{width: parseInt(this.state.postWidth), height: 1, backgroundColor: '#f9f9f9'}}>
    <Text style={{fontSize: 22, color: '#e8e8e8', textAlign: 'center'}}>
   ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
    </Text>
      </View>
</View>
      </View>) : (null) }
      </View>
    );
  }
}
class Comments extends React.Component {
  constructor(props) {
      super(props);
      const { params } = props.navigation.state;
    this.state = {
        passKey: params.postKey,
        passUserID: params.userID,
        passContent: params.postContent,
        firebaseItems: '',
        passID: params.expoID,
        passNameID: params.passNameID,
        commentInput: "",
        group: params.group,
        time: params.time,
        bsfImage: ' ',
        downloadedImage: false,
        replying: false,
        replyingToKey: ' ',
        replyingToNameID: 0,
    };
}
    state = {
      fontLoaded: false,
    };
  componentDidMount() {
      Expo.Font.loadAsync({
        'JosefinSans-Regular.ttf': require('./JosefinSans-Regular.ttf'),
      });
      this.setState({fontLoaded: true}),
      this.getItems();
 }
 
  renderRow = ({item, index}) => {
    return (
<View style={{flexDirection:'row',backgroundColor:'white'}}>
{item.indent &&
<View style={{flexDirection:'row',backgroundColor:'white'}}>
<View style={{
          width:40,
          backgroundColor: '#ffffff',
          paddingLeft: 10,
          paddingRight: 10,
        }}/>
 <View style={{
          width:iWidth-50,
          height: 50 + item.length,
          backgroundColor: '#ffffff',
          paddingLeft: 10,
          paddingRight: 10,
        }}>
        <View style={{width: 1, height: 10, backgroundColor: '#ffffff'}} />
 <View style={{width: iWidth-50, height: 25, backgroundColor: '#ffffff',flexDirection: 'row'}}>
<View style={{
    width: 24,
    height: 24,
    borderRadius: 24/2,
    backgroundColor: brightColor[((item.nameID * 2)+(this.state.passContent && Math.floor(this.state.passContent.length/10)))]
}}>
<View style={{
    width: 24,
    height: 24,
    borderRadius: 24/2,
    backgroundColor: '#FFFFFFa9',
}}>
<Image style={{height:25,width:25,tintColor:darkColor[((item.nameID * 2)+(this.state.passContent && Math.floor(this.state.passContent.length/10)))]}} source={icons[((item.nameID * 2)+(this.state.passContent && Math.floor(this.state.passContent.length/10)))]} />
</View>
</View>
   <Text style={{
            fontSize: 16,
            color: brightColor[((item.nameID * 2)+(this.state.passContent && Math.floor(this.state.passContent.length/10)))],
            textAlign: 'left',
            fontWeight: 'bold'
          }}>
            { animalNames[((item.nameID * 2)+(this.state.passContent && Math.floor(this.state.passContent.length/10)))]}
          </Text>
<Text style={{
            fontSize: 16,
            color: '#ffffff',
        backgroundColor: '#fe8200',
            textAlign: 'left',
    fontWeight: 'bold',
        borderRadius: 5
          }}>
            {expoID == item.userID ? "YOU" : ""}
          </Text>
        
     <Text style={{
            fontSize: 16,
            color: 'gray',
            textAlign: 'left',
    fontWeight: 'bold'
          }}>
           {this.state.passUserID == item.userID ? " OP" : ""}
          </Text>
    <View style={{width:10,height:1}}/>
    <Text style={{
            fontSize: 12,
            color: 'gray',
          }}>
           {item.time}
          </Text>
</View>
            
<Text style={{
            fontSize: 16,
            color: '#000000',
            textAlign: 'left',
          }}>
            {item.comment}
          </Text>
          <View style={{width: 1, height: 10, backgroundColor: '#ffffff'}} />
            
<View style={{width: parseInt(this.state.postWidth), height: 35, backgroundColor: '#ffffff', flexDirection: 'row',paddingLeft:5}}>
 
 <TouchableHighlight onPress={() => {
         this.pressLike(item.key,item.likes,item.dislikes);
        }}>
<Image style={{height:25,width:25,tintColor:'grey'}} source={require('./CandidtwoImages/unlove.png')} />
                </TouchableHighlight>
            <Text style={{ fontFamily: 'JosefinSans-Regular.ttf', fontSize: 18, color: 'grey'}}>
                         { item.likes }
                    </Text>
    <View style={{width: 6, height: 1, backgroundColor: '#ffffff'}}/>
 <TouchableHighlight onPress={() => {
          this.pressDislike(item.key,item.likes,item.dislikes);
        }}>
            <Image style={{height:25,width:25,tintColor:'grey'}} source={require('./CandidtwoImages/undislike.png')} />
                </TouchableHighlight>
            <Text style={{ fontFamily: 'JosefinSans-Regular.ttf', fontSize: 18, color: 'grey'}}>
                        { item.dislikes }
                    </Text>
<View style={{width: 20, height: 1, backgroundColor: 'white'}}/>
    <TouchableWithoutFeedback onPress={() => {
    if (item.userID == expoID){Alert.alert("Error: you can not send a direct message to yourself.")} else { this.props.navigation.navigate('Chat',{postKey: this.state.passKey, userID: item.userID,name: animalNames[((item.nameID * 2)+(this.state.passContent && Math.floor(this.state.passContent.length/10)))] ,opl: this.state.passContent.length,nameID:item.nameID,group:this.state.group})  }}}>
        <Image style={{width:25,height:25,tintColor:'grey'}}source={require('./CandidtwoImages/mail.png')}/>
    </TouchableWithoutFeedback>
    <View style={{width: 18, height: 1, backgroundColor: 'white'}}/>
<TouchableHighlight onPress={() => {

if (item.indent == false){
    this.setState({
        replying:true,
        replyingToKey:item.key,
        replyingToNameID:((item.nameID * 2)+(this.state.passContent && Math.floor(this.state.passContent.length/10))),
        })
}

if (item.indent){
    this.setState({
        replying:true,
        replyingToKey:item.parentKey,
        replyingToNameID:((item.nameID * 2)+(this.state.passContent && Math.floor(this.state.passContent.length/10))),
        })
}

if (this.state.commentInput.length < 1){
 this.setState({commentInput: '@'+animalNames[((item.nameID * 2)+(this.state.passContent && Math.floor(this.state.passContent.length/10)))]+' '})
}

}}>
 <Text style={{ fontSize: 12, color: 'grey'}}>
        Reply
                    </Text>
                </TouchableHighlight>
    <View style={{width: 18, height: 1, backgroundColor: 'white'}}/>
    <TouchableWithoutFeedback onPress={() => { Clipboard.setString(item.comment); Alert.alert('Copied text');}}>
        <Image style={{width:20,height:20,tintColor:'grey'}}source={require('./CandidtwoImages/copytext.png')}/>
    </TouchableWithoutFeedback>
    </View>
    </View>
</View>
}
{item.indent==false &&
<View>
        <View style={{
          width:parseInt(this.state.postWidth),
          height: 50 + item.length,
          backgroundColor: '#ffffff',
          paddingLeft: 10,
          paddingRight: 10,
        }}>
        <View style={{width: 1, height: 10, backgroundColor: '#ffffff'}} />
 <View style={{width: parseInt(this.state.postWidth), height: 25, backgroundColor: '#ffffff',flexDirection: 'row'}}>
<View style={{
    width: 24,
    height: 24,
    borderRadius: 24/2,
    backgroundColor: brightColor[((item.nameID * 2)+(this.state.passContent && Math.floor(this.state.passContent.length/10)))]
}}>
<View style={{
    width: 24,
    height: 24,
    borderRadius: 24/2,
    backgroundColor: '#FFFFFFa9',
}}>
<Image style={{height:25,width:25,tintColor:darkColor[((item.nameID * 2)+(this.state.passContent && Math.floor(this.state.passContent.length/10)))]}} source={icons[((item.nameID * 2)+(this.state.passContent && Math.floor(this.state.passContent.length/10)))]} />
</View>
</View>
   <Text style={{
            fontSize: 16,
            color: brightColor[((item.nameID * 2)+(this.state.passContent && Math.floor(this.state.passContent.length/10)))],
            textAlign: 'left',
            fontWeight: 'bold'
          }}>
            { animalNames[((item.nameID * 2)+(this.state.passContent && Math.floor(this.state.passContent.length/10)))]}
          </Text>
<Text style={{
            fontSize: 16,
            color: '#ffffff',
        backgroundColor: '#fe8200',
            textAlign: 'left',
    fontWeight: 'bold',
        borderRadius: 5
          }}>
            {expoID == item.userID ? "YOU" : ""}
          </Text>
        
     <Text style={{
            fontSize: 16,
            color: 'gray',
            textAlign: 'left',
    fontWeight: 'bold'
          }}>
           {this.state.passUserID == item.userID ? " OP" : ""}
          </Text>
    <View style={{width:10,height:1}}/>
    <Text style={{
            fontSize: 12,
            color: 'gray',
          }}>
           {item.time}
          </Text>
</View>
            
<Text style={{
            fontSize: 16,
            color: '#000000',
            textAlign: 'left',
          }}>
            {item.comment}
          </Text>
          <View style={{width: 1, height: 10, backgroundColor: '#ffffff'}} />
            
<View style={{width: parseInt(this.state.postWidth), height: 35, backgroundColor: '#ffffff', flexDirection: 'row',paddingLeft:5}}>
 
 <TouchableHighlight onPress={() => {
         this.pressLike(item.key,item.likes,item.dislikes);
        }}>
<Image style={{height:25,width:25,tintColor:'grey'}} source={require('./CandidtwoImages/unlove.png')} />
                </TouchableHighlight>
            <Text style={{ fontFamily: 'JosefinSans-Regular.ttf', fontSize: 18, color: 'grey'}}>
                         { item.likes }
                    </Text>
    <View style={{width: 6, height: 1, backgroundColor: '#ffffff'}}/>
 <TouchableHighlight onPress={() => {
          this.pressDislike(item.key,item.likes,item.dislikes);
        }}>
            <Image style={{height:25,width:25,tintColor:'grey'}} source={require('./CandidtwoImages/undislike.png')} />
                </TouchableHighlight>
            <Text style={{ fontFamily: 'JosefinSans-Regular.ttf', fontSize: 18, color: 'grey'}}>
                        { item.dislikes }
                    </Text>
<View style={{width: 20, height: 1, backgroundColor: 'white'}}/>
    <TouchableWithoutFeedback onPress={() => {
    if (item.userID == expoID){Alert.alert("Error: you can not send a direct message to yourself.")} else { this.props.navigation.navigate('Chat',{postKey: this.state.passKey, userID: item.userID,name: animalNames[Math.floor((this.state.passContent.length/10) + item.nameID*2)], opl: this.state.passContent.length,nameID:item.nameID,group:this.state.group})  }}}>
        <Image style={{width:25,height:25,tintColor:'grey'}}source={require('./CandidtwoImages/mail.png')}/>
    </TouchableWithoutFeedback>
    <View style={{width: 18, height: 1, backgroundColor: 'white'}}/>
<TouchableHighlight onPress={() => {

if (item.indent == false){
    this.setState({
        replying:true,
        replyingToKey:item.key,
        replyingToNameID:((item.nameID * 2)+(this.state.passContent && Math.floor(this.state.passContent.length/10))),
        })
}

if (item.indent){
    this.setState({
        replying:true,
        replyingToKey:item.parentKey,
        replyingToNameID:((item.nameID * 2)+(this.state.passContent && Math.floor(this.state.passContent.length/10))),
        })
}

if (this.state.commentInput.length < 1){
 this.setState({commentInput: '@'+animalNames[((item.nameID * 2)+(this.state.passContent && Math.floor(this.state.passContent.length/10)))]+' '})
}

}}>
 <Text style={{ fontSize: 12, color: 'grey'}}>
        Reply
                    </Text>
                </TouchableHighlight>
    <View style={{width: 18, height: 1, backgroundColor: 'white'}}/>
    <TouchableWithoutFeedback onPress={() => { Clipboard.setString(item.comment); Alert.alert('Copied text');}}>
        <Image style={{width:20,height:20,tintColor:'grey'}}source={require('./CandidtwoImages/copytext.png')}/>
    </TouchableWithoutFeedback>
    </View>
    </View>
</View>
}
</View>
    );
  };
  _onRefresh() {
    this.setState({refreshing: true});
    this.getItems()
  }
  getItems() {
this.setState({passItems:[]})
    var query = firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey+'/commentlist').orderByKey();
    query.once('value').then((snap) => {
        var items = [];
        snap.forEach((child) => {
            items.push({
        comment: child.val().comment,
        nameID: child.val().userNameId,
        userID: child.val().userID,
        likes: child.val().likes,
        dislikes: child.val().dislikes,
        key: child.key,
        time: child.val().time,
    replies: child.val().replies,
    indent: false,
            });
        });
console.log(items)
        for (i = 0; i < items.length; i++) {
var timeStamp = 'error';
var secondsBtwn = Math.floor((Date.now() - items[i].time)/1000);
if (secondsBtwn > 31536000){
        timeStamp = Math.floor(secondsBtwn/31536000) + 'y';
    }else if (secondsBtwn >= 604800){
        timeStamp = Math.floor(secondsBtwn/604800) + 'w';
    }else if (secondsBtwn >= 86400){
        timeStamp = Math.floor(secondsBtwn/86400) + 'd';
    }else if (secondsBtwn >= 3600){
        timeStamp = Math.floor(secondsBtwn/3600) + 'h';
    }else if (secondsBtwn >= 60){
        timeStamp = Math.floor(secondsBtwn/60) + 'm';
    }else{
        timeStamp = Math.floor(secondsBtwn) + 's';
    }
items[i].time = timeStamp;
}

this.setState({passItems:items})
    }).then(()=>{

var gotreplies = false
for (i = 0; i < this.state.passItems.length; i++) {
  if (this.state.passItems[i].replies == true){
    this.getReplies(this.state.passItems[i].key,i);
    gotreplies = true;
 }
}
     if (gotreplies == false){
        this.setState({firebaseItems:this.state.passItems})
     }
        this.setState({refreshing: false});
if(this.state.downloadedImage == false){
    firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey).once("value", dataSnapshot => {
     image = dataSnapshot.val().image
    }).then(()=>{
    this.setState({bsfImage: image})
    })
    firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey).once("value", dataSnapshot => {
     imageW = dataSnapshot.val().imageW
    }).then(()=>{
    this.setState({imageW: imageW})
    })
    firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey).once("value", dataSnapshot => {
     imageH = dataSnapshot.val().imageH
    }).then(()=>{
    this.setState({imageH: imageH})
    })
    firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey).once("value", dataSnapshot => {
     comments = dataSnapshot.val().comments
    }).then(()=>{
    this.setState({numOfComments: comments})
    })
firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey).once("value", dataSnapshot => {
     likes = dataSnapshot.val().likes
    }).then(()=>{
    this.setState({postLikes: likes})
    })
firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey).once("value", dataSnapshot => {
     dislikes = dataSnapshot.val().dislikes
    }).then(()=>{
    this.setState({postDislikes: dislikes})
    })
       this.setState({downloadedImage:true})
firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey).once("value", dataSnapshot => {
     timestamp = dataSnapshot.val().time
    }).then(()=>{
var timeStamp = 'error';
var secondsBtwn = Math.floor((Date.now() - timestamp)/1000);
if (secondsBtwn > 31536000){
        timeStamp = Math.floor(secondsBtwn/31536000) + 'y';
    }else if (secondsBtwn >= 604800){
        timeStamp = Math.floor(secondsBtwn/604800) + 'w';
    }else if (secondsBtwn >= 86400){
        timeStamp = Math.floor(secondsBtwn/86400) + 'd';
    }else if (secondsBtwn >= 3600){
        timeStamp = Math.floor(secondsBtwn/3600) + 'h';
    }else if (secondsBtwn >= 60){
        timeStamp = Math.floor(secondsBtwn/60) + 'm';
    }else{
        timeStamp = Math.floor(secondsBtwn) + 's';
    }
this.state.time = timeStamp;
    })
}
})
}

getReplies(key,indexnum){
var query = firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey+'/commentlist/'+key+'/replylist').orderByKey();
    query.once('value').then((snap) => {
    var replies = [];
        snap.forEach((child) => {
        replies.push({
           comment: child.val().comment,
           nameID: child.val().userNameId,
           userID: child.val().userID,
           likes: child.val().likes,
           dislikes: child.val().dislikes,
           key: child.key,
           time: child.val().time,
           indent: true,
	   parentKey: child.val().parentKey,
          });
        });

var items = this.state.passItems
for (i = 0; i < replies.length; i++) {
var timeStamp = 'error';
var secondsBtwn = Math.floor((Date.now() - replies[i].time)/1000);
if (secondsBtwn > 31536000){
        timeStamp = Math.floor(secondsBtwn/31536000) + 'y';
    }else if (secondsBtwn >= 604800){
        timeStamp = Math.floor(secondsBtwn/604800) + 'w';
    }else if (secondsBtwn >= 86400){
        timeStamp = Math.floor(secondsBtwn/86400) + 'd';
    }else if (secondsBtwn >= 3600){
        timeStamp = Math.floor(secondsBtwn/3600) + 'h';
    }else if (secondsBtwn >= 60){
        timeStamp = Math.floor(secondsBtwn/60) + 'm';
    }else{
        timeStamp = Math.floor(secondsBtwn) + 's';
    }
replies[i].time = timeStamp;
 }

replies.reverse();
for (i = 0; i < replies.length; i++){
 for (k = 0; k < items.length; k++){
  if (replies[i].parentKey == items[k].key){
   items.splice(k+1,0,replies[i])
  }
 }
}
 this.setState({passItems: items})
 this.setState({firebaseItems: items})
})

}
updateVotes(key,vote){
var items = this.state.firebaseItems;
   for (i = 0; i < items.length; i++) {
     if (items[i].key == key){
         if (vote == 'd'){
    var passNum = items[i].dislikes+1;
    items[i].dislikes = passNum;
    break;
    }else{
    var passNum = items[i].likes+1;
    items[i].likes = passNum
    break;
    }
     }
   }
    this.setState({firebaseItems: [{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'AMA',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     }]
   })
    this.setState({firebaseItems: items})
}
pressDislike(key,likes,dislikes){
    var usersLiked = [];
    var query = firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey+'/commentlist/'+key+'/usersVoted').orderByKey();
    query.once ('value', (snap) => {
      snap.forEach ( (child) => {       
       usersLiked.push({
         expoID:child.val().expoID
     });
     })
     }).then(() => {
      var addUserID = true;
             for (i = 0; i < usersLiked.length; i++) {
                if (usersLiked[i].expoID == expoID){
             var addUserID = false;
    }
    }
if (addUserID == true){
    firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey+'/commentlist/'+key+'/votes/'+expoID).update({ voteNum: '0' })
    firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey+'/commentlist/'+key+'/usersVoted').push().set({ expoID:expoID })
}
}).then(() =>{
firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey+'/commentlist/'+key+'/votes/'+expoID).once("value", dataSnapshot => {
 voteNum=dataSnapshot.val().voteNum
}).then(() =>{
if (voteNum == 0){
   firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey+'/commentlist/'+key).update({ dislikes:dislikes + 1 });
   firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey+'/commentlist/'+key+'/votes/'+expoID).update({ voteNum: '1' });
   this.updateVotes(key,'d');
  }
})
  })
}
pressLike(key,likes,dislikes){
    var usersLiked = [];
    var query = firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey+'/commentlist/'+key+'/usersVoted').orderByKey();
    query.once ('value', (snap) => {
      snap.forEach ( (child) => {       
       usersLiked.push({
         expoID:child.val().expoID
     });
     })
     }).then(() => {
      var addUserID = true;
             for (i = 0; i < usersLiked.length; i++) {
                if (usersLiked[i].expoID == expoID){
             var addUserID = false;
    }
    }
if (addUserID == true){
    firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey+'/commentlist/'+key+'/votes/'+expoID).update({ voteNum: '0' })
    firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey+'/commentlist/'+key+'/usersVoted').push().set({ expoID:expoID })
}
}).then(() =>{
firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey+'/commentlist/'+key+'/votes/'+expoID).once("value", dataSnapshot => {
 voteNum=dataSnapshot.val().voteNum
}).then(() =>{
if (voteNum == 0){
   firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey+'/commentlist/'+key).update({ likes: likes + 1 });
   firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey+'/commentlist/'+key+'/votes/'+expoID).update({ voteNum: '2' });
   this.updateVotes(key,'l');
  }
})
  })
}



pressLikeP(key,likes,dislikes,group){
    var usersLiked = [];
    var query = firebase.database().ref('posts/'+group+'/posts/'+key+'/usersVoted').orderByKey();
    query.once ('value', (snap) => {
      snap.forEach ( (child) => {       
       usersLiked.push({
         expoID:child.val().expoID
     });
     })
     }).then(() => {
      var addUserID = true;
             for (i = 0; i < usersLiked.length; i++) {
                if (usersLiked[i].expoID == expoID){
             var addUserID = false;
    }
    }
if (addUserID == true){
    firebase.database().ref('posts/'+group+'/posts/'+key+'/votes/'+expoID).update({ voteNum: '0' })
    firebase.database().ref('posts/'+group+'/posts/'+key+'/usersVoted').push().set({ expoID:expoID })
}
}).then(() =>{
firebase.database().ref('posts/'+group+'/posts/'+key+'/votes/'+expoID).once("value", dataSnapshot => {
 voteNum=dataSnapshot.val().voteNum
}).then(() =>{
if (voteNum == 0){
   firebase.database().ref('posts/'+group+'/posts/'+key).update({ likes: likes + 1 });
   firebase.database().ref('posts/'+group+'/posts/'+key+'/votes/'+expoID).update({ voteNum: '2' });
   this.setState({postLikes: this.state.postLikes+1})
  }
})
  })
}
pressDislikeP(key,likes,dislikes,group){
       var usersLiked = [];
    var query = firebase.database().ref('posts/'+group+'/posts/'+key+'/usersVoted').orderByKey();
    query.once ('value', (snap) => {
      snap.forEach ( (child) => {       
       usersLiked.push({
         expoID:child.val().expoID
     });
     })
     }).then(() => {
      var addUserID = true;
             for (i = 0; i < usersLiked.length; i++) {
                if (usersLiked[i].expoID == expoID){
             var addUserID = false;
    }
    }
if (addUserID == true){
    firebase.database().ref('posts/'+group+'/posts/'+key+'/votes/'+expoID).update({ voteNum: '0' })
    firebase.database().ref('posts/'+group+'/posts/'+key+'/usersVoted').push().set({ expoID:expoID })
}
}).then(() =>{
firebase.database().ref('posts/'+group+'/posts/'+key+'/votes/'+expoID).once("value", dataSnapshot => {
 voteNum=dataSnapshot.val().voteNum
}).then(() =>{
if (voteNum == 0){
   firebase.database().ref('posts/'+group+'/posts/'+key).update({ dislikes:dislikes + 1 });
   firebase.database().ref('posts/'+group+'/posts/'+key+'/votes/'+expoID).update({ voteNum: '1' });
   this.setState({postDislikes: this.state.postDislikes+1})
  }     
})
  })
}

deletePost(){
  var deletePassKey = this.state.passKey;
  firebase.database().ref('posts/'+this.state.group+'/posts/'+deletePassKey).remove();
}
notifyPeople(){
  var addedUsers = [];
  var firebaseItems = this.state.firebaseItems;
  for (i = 0; i < this.state.firebaseItems.length; i++) {
  if (expoID != firebaseItems[i].userID && this.state.passUserID != firebaseItems[i].userID ){
    var uploadID = true;
    for (k = 0; k < addedUsers.length; k++) {
       if (this.state.firebaseItems[i].userID == addedUsers[k] ){
     var uploadID = false;
     break;
       }
     }
    if (uploadID){
    firebase.database().ref('users/'+this.state.firebaseItems[i].userID+'/notifications').push().set({
      time: this.state.time,
      group: this.state.group,
      okey: this.state.passKey,
      content: this.state.commentInput,
      color: '#ffc7a5',
      postContent: this.state.passContent,
      postUserExpoID: this.state.passUserID,
      postUserNameID: this.state.passNameID,
      nameNumber: (expoNameIDConst * 2)+(this.state.passContent && Math.floor(this.state.passContent.length/10))
        })
    addedUsers.push(this.state.firebaseItems[i].userID)
    }
}
}
}
render() {
  const { params } = this.props.navigation.state;
    
  return (
    <View style={{ flex: 10000, backgroundColor: '#e8e8e8'}}>
{this.state.fontLoaded ? (
      <View style={{ flex: 10000, backgroundColor: '#e8e8e8'}}>
         <View style={{width: 2500, height: 3, backgroundColor: '#f4f4f4'}}></View>
<View style={{width: this.state.postWidth, height: 40, backgroundColor: '#f4f4f4',flexDirection:'row',justifyContent:'center'}}>
            <TextInput
                 style={{height:40, width: 260, borderRadius:7,paddingRight:7,paddingLeft:7,backgroundColor:'#D3D3D3'}}
                 onChangeText={(commentInput)=>this.setState({commentInput})}
                 value={this.state.commentInput}   
         autoCorrect={true}
         underlineColorAndroid={'#D3D3D3'}
         autoCapitalize={('sentences')}
     placeholder={"Leave a comment"}
         placeholderTextColor={'#696969'}
             />
<View style={{width: 5, height: 3, backgroundColor:'#f4f4f4'}}></View>
<Button
      style={{justifyContent: 'center'}}
      onPress={() => {  
Keyboard.dismiss()
this.getItems();
        if (this.state.commentInput.length>0) {
if (this.state.replying == false) {
            firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey+'/commentlist').push().set({ comment:this.state.commentInput, userNameId:expoNameIDConst, userID: expoID, likes: 0, dislikes: 0,time:Date.now(),replies:false })
}
if (this.state.replying == true){
 firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey+'/commentlist/'+this.state.replyingToKey+'/replylist').push().set({ comment:this.state.commentInput, userNameId:expoNameIDConst, userID: expoID, likes: 0, dislikes: 0,time:Date.now(),parentKey: this.state.replyingToKey })
 firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.passKey+'/commentlist/'+this.state.replyingToKey).update({
    replies: true,
 })
this.setState({replying: false})
}
    if (expoID != this.state.passUserID){
    firebase.database().ref('users/'+this.state.passUserID+'/notifications').push().set({
      time: this.state.time,
      group: this.state.group,
      okey: this.state.passKey,
      content: this.state.commentInput,
      color: '#ffc7a5',
      postContent: params &&params.postContent,
      postUserExpoID: this.state.passUserID,
      postUserNameID: params.passNameID,
      nameNumber: (expoNameIDConst * 2)+(this.state.passContent && Math.floor(this.state.passContent.length/10))
        })}
        this.notifyPeople();
          firebase.database().ref('posts/'+this.state.group+'/posts').child(this.state.passKey).update({ newestComment: this.state.commentInput
        })
      
    firebase.database().ref('posts/'+this.state.group+'/posts').child(this.state.passKey).update({
      comments: this.state.firebaseItems.length+1
        })
            this.setState({commentInput:''});
        this.getItems();
    }
    else {    
        Alert.alert("Please add some content before commenting.")
    }
   
      }}               
      title="   +   "
      color="#fe8200"
    />
 </View>
<View style={{width: 2500, height: 3, backgroundColor: '#f4f4f4'}}></View>
{this.state.replying == true &&
<TouchableHighlight onPress={() => {this.setState({replying:false})}}>
<View style={{width: this.state.postWidth, height: 35, backgroundColor: '#f4f4f4'}}>
<View style={{flexDirection:'row'}}>
<Text style={{
            fontSize: 16,
            color: '#000000',
            textAlign: 'left',
          }}>
            Replying to{' '}
          </Text>
<Text style={{
            fontSize: 16,
            color: brightColor[this.state.replyingToNameID],
            textAlign: 'left',
          }}>
            {animalNames[this.state.replyingToNameID]}
          </Text>
</View>
<Text style={{
            fontSize: 10,
            color: 'grey',
            textAlign: 'left',
          }}>
            press here to stop replying
          </Text>
</View>
</TouchableHighlight>
}
    <ScrollView
           refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />
        }>
           <View style={{paddingLeft: 5, paddingRight:5}}>
      <View style={{width: 1, height: 6, backgroundColor: '#e8e8e8'}} />
 <View elevation={2} style={{ shadowOpacity:0.5,shadowRadius:2, width: parseInt(this.state.postWidth), height: 35, backgroundColor: brightColor[Math.floor((params &&params.postContent.length/10)+(params.passNameID * 2))], borderTopLeftRadius: 7, borderTopRightRadius: 7, paddingTop:5,paddingLeft:5,flexDirection:'row',justifyContent: 'space-between',
}}>
<View style={{
    width: 24,
    height: 24,
    borderRadius: 24/2,
    backgroundColor: '#FFFFFFa9',
}}>
                    <Image style={{height:27,width:27,tintColor:darkColor[Math.floor(params && params.postContent.length/10 + (params.passNameID * 2))]}} source={icons[Math.floor(params && params.postContent.length/10 + (params.passNameID * 2))]} />
</View>
                    <Text style={{ fontWeight:'bold',fontSize: 17,color: '#ffffff'}}>
                        { animalNames[Math.floor(params && params.postContent.length/10 + (params.passNameID * 2))] }
                    </Text>
    <View style={{width: 2, height: 1, backgroundColor: brightColor[Math.floor(params && params.postContent.length/10 + (params.passNameID * 2))]}}/>
    <View style={{width: 2, height: 1, backgroundColor: brightColor[Math.floor(params && params.postContent.length/10 + (params.passNameID * 2))]}}/>
    <View style={{width: 2, height: 1, backgroundColor: brightColor[Math.floor(params && params.postContent.length/10 + (params.passNameID * 2))]}}/>
<View style={{width: this.state.postWidth, height: 20,flexDirection:'row'}}>
<Text style={{
            fontSize: 15,
            color: '#ffffff',
        backgroundColor: '#fe8200',
            textAlign: 'left',
    fontWeight: 'bold',
        borderRadius: 5
          }}>
            {expoID == this.state.passUserID ? "YOU" : ""}
          </Text>
    <View style={{width: 8, height: 1, backgroundColor: brightColor[Math.floor((params &&params.postContent.length/10)+(params.passNameID * 2))]}}/>
<Text style={{
        fontSize: 15,
        color: '#ffffff',
        backgroundColor: '#fe8200',
        textAlign: 'left',
        borderRadius: 5,
    fontWeight: 'bold'
          }}>
            {Math.floor(this.state.passContent.length/30)+1}
          </Text>
    <View style={{width: 8, height: 1, backgroundColor: brightColor[Math.floor((params &&params.postContent.length/10)+(params.passNameID * 2))]}}/>
 <TouchableWithoutFeedback onPress={() => { this.props.navigation.navigate('groupView',{group: this.state.group})}}>
<Text style={{
        fontSize: 15,
        color: brightColor[Math.floor((params &&params.postContent.length/10)+(params.passNameID * 2))],
        backgroundColor: '#ffffff',
        textAlign: 'left',
        borderRadius: 14,
    fontWeight: 'bold'
          }}>
            {' '+this.state.group+' '}
          </Text>
</TouchableWithoutFeedback>
    <View style={{width: 8, height: 1, backgroundColor: brightColor[Math.floor((params &&params.postContent.length/10)+(params.passNameID * 2))]}}/>
</View>
        </View>
<View elevation={2} style={{height:15,width:this.state.postWidth,paddingRight:5, backgroundColor: brightColor[Math.floor((params &&params.postContent.length/10)+(params.passNameID * 2))],flexDirection:'row'}}>
<View style={{width:6,height:1}}/>
  <Text style={{
        fontSize: 12,
        color: '#f4f4f4',
          }}>
            {this.state.time}
          </Text>
</View>
      <View elevation={2} style={{width: parseInt(this.state.postWidth), height: this.state.postWidth, backgroundColor: brightColor[Math.floor((params &&params.postContent.length/10)+(params.passNameID * 2))],justifyContent: 'center',paddingTop:35,paddingBottom:60}}>
<View style={{paddingRight:12,paddingLeft:12}}>
    <Text style={{fontSize: 22, color: '#ffffff', textAlign: 'center',fontFamily: 'JosefinSans-Regular.ttf'}}>
      {params && params.postContent}
    </Text>
</View>
 {this.state.bsfImage.length != 1 &&
    <View style={{paddingTop:15}}>
    <Image style={{width:iWidth, height: (iWidth*this.state.imageH)/this.state.imageW}} source={{uri: 'data:image/png;base64,'+this.state.bsfImage}}/>
    </View>
      }
      </View>

   <View elevation={2} style={{width: parseInt(this.state.postWidth), height: 40, borderBottomLeftRadius: 7, borderBottomRightRadius: 7, backgroundColor: darkColor[Math.floor((params &&params.postContent.length/10)+(params.passNameID * 2))], flexDirection: 'row',paddingLeft:5,justifyContent:'space-between'}}>
 
 <TouchableHighlight onPress={() => {
         this.pressLikeP(this.state.passKey,this.state.postLikes,this.state.postDislikes,this.state.group);
        }}>
<Image style={{height:39,width:39,tintColor:'white'}} source={require('./CandidtwoImages/unlove.png')} />
                </TouchableHighlight>
            <Text style={{ fontFamily: 'JosefinSans-Regular.ttf',  fontSize: 20, color: '#ffffff',paddingTop:5}}>
                         { this.state.postLikes }
                    </Text>
    <View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((params &&params.postContent.length/10)+(params.passNameID * 2))]}}/>
    <View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((params &&params.postContent.length/10)+(params.passNameID * 2))]}}/>
<View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((params &&params.postContent.length/10)+(params.passNameID * 2))]}}/>
 <TouchableHighlight onPress={() => {
         this.pressDislikeP(this.state.passKey,this.state.postLikes,this.state.postDislikes,this.state.group);
        }}>
            <Image style={{height:39,width:39,tintColor:'white'}} source={require('./CandidtwoImages/undislike.png')} />
                </TouchableHighlight>
            <Text style={{ fontFamily: 'JosefinSans-Regular.ttf', fontSize: 20, color: '#ffffff',paddingTop:5}}>
                        { this.state.postDislikes }
                    </Text>
     <View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((params &&params.postContent.length/10)+(params.passNameID * 2))]}}/>
    <View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((params &&params.postContent.length/10)+(params.passNameID * 2))]}}/>
    <View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((params &&params.postContent.length/10)+(params.passNameID * 2))]}}/>

    <Image style={{height:39,width:39}} source={require('./CandidtwoImages/comments.png')}/>
 <Text style={{ fontFamily: 'JosefinSans-Regular.ttf',  fontSize: 20, color: '#ffffff',paddingTop:5}}>
                        { this.state.numOfComments && this.state.numOfComments }
                   </Text>
<View style={{width: 20, height: 1, backgroundColor: darkColor[Math.floor((params &&params.postContent.length/10)+(params.passNameID * 2))]}}/>
<View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((params &&params.postContent.length/10)+(params.passNameID * 2))]}}/>
        <TouchableWithoutFeedback onPress={() => {
    if (this.state.passUserID
 == expoID){Alert.alert("Error: you can not send a direct message to yourself.")} else { this.props.navigation.navigate('Chat',{postKey: this.state.passKey, userID:this.state.passUserID, name: animalNames[Math.floor((this.state.passContent.length/10)+this.state.passNameID * 2)], opl: this.state.passContent.length,nameID:this.state.passNameID,group:this.state.group})  }}}>
        <Image style={{width:34,height:36,tintColor:'white'}}source={require('./CandidtwoImages/mail.png')}/>
    </TouchableWithoutFeedback>
    <View style={{width: 20, height: 1, backgroundColor: darkColor[Math.floor((params &&params.postContent.length/10)+(params.passNameID * 2))]}}/>
<View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((params &&params.postContent.length/10)+(params.passNameID * 2))]}}/>
    <TouchableWithoutFeedback onPress={() => { Clipboard.setString(params && params.postContent)}}>
        <Image style={{width:34,height:33,tintColor:'white'}}source={require('./CandidtwoImages/copytext.png')}/>
    </TouchableWithoutFeedback>
 <View style={{width: 1, height: 6, backgroundColor: darkColor[Math.floor((params &&params.postContent.length/10)+(params.passNameID * 2))]}}/>
    </View>





       
    <View style={{width: 1, height: 6, backgroundColor: '#e8e8e8'}} />
    <FlatList data = {this.state.firebaseItems}
    renderItem={this.renderRow} />
     <View style={{width: 1, height: 500, backgroundColor: '#e8e8e8'}}/>
<Button
        onPress={() =>{
        if (expoID == this.state.passUserID){
       this.deletePost();
       Alert.alert("Post deleted")
     } else {
      Alert.alert("Error: You are not OP")
     }
    }}
        title="Delete this post"
    color="red"
      />
     <View style={{width: parseInt(this.state.postWidth), height: 6, backgroundColor: '#e8e8e8'}}>
    <Text style={{fontSize: 22, color: '#e8e8e8', textAlign: 'center'}}>
   ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
    </Text>
      </View>
</View>
    </ScrollView>
    </View>) : (null) }
    </View>
    );
  }
}
class Notifications extends React.Component {
   
  static navigationOptions = {
    header:null,
    tabBarVisible: false,
    tabBarIcon: () => (
      <Image
        source={require('./CandidtwoImages/NotificationIcon.png')}
        style={[styles.icon, {tintColor: '#A9A9A9'}]}
      />
    ),
  };
async componentDidMount() {
    await Font.loadAsync({
      'JosefinSans-Regular.ttf': require('./JosefinSans-Regular.ttf'),
    });
    this.setState({ fontLoaded: true });
  }
 state = {fontLoaded: false,notifs:0};
componentWillMount(){
this.getItems();
}
  _onRefresh() {
    this.setState({refreshing: true});
    this.getItems()
  }
      
getItems(){
var query = firebase.database().ref('users/' + expoID + '/notifications').limitToLast(80).orderByKey();
query.once('value', (snap) => {
  var items = [];
  snap.forEach((child) => {
    items.push({
      content: ' ' + child.val().content,
      postKey: child.val().okey,
      color: child.val().color,
      notifKey: child.key,
      postContent: child.val().postContent,
      postUserExpoID: child.val().postUserExpoID,
      postUserNameID: child.val().postUserNameID,
      nameNumber: child.val().nameNumber,
      group: child.val().group,
      time: child.val().time,
    });
  })
  items.reverse();
  this.setState({ firebaseItems: items });
  this.setState({refreshing: false});
     var counter = 0;
     for (i = 0; i < items.length; i++) {
       if (items[i].color == '#ffc7a5') {
	counter = counter+1;
       }
     }
     this.setState({notifs:counter})
})
 }
 render() {
    return (
      <View style={styles.container}>
{this.state.fontLoaded ? (
      <View style={styles.container}>
<View>
<View style={{width: this.state.postWidth, height: 50, backgroundColor: 'white'}}>
         <View style={{width: this.state.postWidth, height: 50, backgroundColor: '#f9f9f9',alignItems:'center',justifyContent:'space-between',flexDirection:'row'}}>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Notifs')}}>
<View style={{ height:50,width:iWidth/2,backgroundColor:'#fe8200',alignItems:'center'}}>
<View style={{width: 2, height: 27}}/>
 <Text style={{ fontSize: 12,color:'white' }}>
               Notifications
            </Text>
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('myGroups')}}>
<View style={{ height:50,width:iWidth/2,backgroundColor:'#f9f9f9',alignItems:'center'}}>
<View style={{width: 2, height: 27}}/>
 <Text style={{ fontSize: 12,color:'#929292' }}>
              My Groups
            </Text>
</View>  
</TouchableHighlight>
</View>
</View>
  <View style={{width: parseInt(this.state.postWidth), height: 1, backgroundColor: '#e8e8e8'}}>
    <Text style={{fontSize: 22, color: '#e8e8e8', textAlign: 'center'}}>
   ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
    </Text>
      </View>
</View>
 <ScrollView   
refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />
        }>

<View style={{width: 1, height: 6, backgroundColor: '#e8e8e8'}} />
    <View style={{width: parseInt(this.state.postWidth), height: this.state.postWidth, backgroundColor: '#2d2d2d',  alignItems: 'center',             justifyContent: 'center',    borderRadius: 10, paddingLeft: 10, paddingRight:10,paddingTop:4,paddingBottom:4}} >       
<View style={{width: parseInt(this.state.postWidth), height: this.state.postWidth, backgroundColor: '#2d2d2d',  alignItems: 'center',             justifyContent: 'center',    borderRadius: 10, paddingLeft: 10, paddingRight:10,flexDirection:'row'}} >
      <Image source={require('./CandidtwoImages/starTab.png')} style={{width: 30,height: 30,tintColor:'white'}}/>
      <Image source={require('./CandidtwoImages/starTab.png')} style={{width: 30,height: 30,tintColor:'white'}}/>
      <Image source={require('./CandidtwoImages/starTab.png')} style={{width: 30,height: 30,tintColor:'white'}}/>
      <Image source={require('./CandidtwoImages/starTab.png')} style={{width: 30,height: 30,tintColor:'white'}}/>
      <Image source={require('./CandidtwoImages/starTab.png')} style={{width: 30,height: 30,tintColor:'white'}}/>
            </View>
<Text style={{ fontFamily: 'JosefinSans-Regular.ttf', fontSize: 22, color: '#ffffff', textAlign: 'center'}}>
                       It would really help if google play users gave this app a 5 star review
                   </Text>
<View style={{width: parseInt(this.state.postWidth), height: this.state.postWidth, backgroundColor: '#2d2d2d',  alignItems: 'center',             justifyContent: 'center',    borderRadius: 10, paddingLeft: 10, paddingRight:10,flexDirection:'row'}} >
  <Button
      style={{justifyContent: 'center'}}
      onPress={() => {
    Clipboard.setString('https://play.google.com/store/apps/details?id=com.giise.phoenix');
      }}               
      title="Copy link"
      color="#A9A9A9"
    />
<View style={{width:3,height:1,backgroundColor: '#2d2d2d',}} />
<Button
      style={{justifyContent: 'center'}}
      onPress={() => {
    Expo.WebBrowser.openBrowserAsync('https://play.google.com/store/apps/details?id=com.giise.phoenix')
      }}               
      title="Open Play Store"
      color="#A9A9A9"
    />
</View>
</View>
 <View style={{width: 1, height: 6, backgroundColor: '#e8e8e8'}} />
    <View style={{width: this.state.postWidth, height: 1, backgroundColor: 'grey'}} />
<FlatList
  data={this.state.firebaseItems}
  renderItem={({item}) =>
    <View>
<View style={{width: parseInt(this.state.postWidth), height: this.state.postWidth, backgroundColor: item.color,  alignItems: 'center', justifyContent: 'center', paddingLeft: 10, paddingRight:10,flexDirection:'row'}} >
<TouchableWithoutFeedback onPress={() => {
        this.props.navigation.navigate('CommentScreen',{postKey: item.postKey, postContent: item.postContent, passNameID: item.postUserNameID, userID: item.postUserExpoID,group:item.group})
firebase.database().ref('users/'+expoID+'/notifications').child(item.notifKey).update({ color: "#e8e8e8" })
this.getItems();
      }}>             
<View style={{width: parseInt(this.state.postWidth), height: this.state.postWidth, backgroundColor: item.color,  alignItems: 'center', justifyContent: 'center', paddingLeft: 50, paddingRight:10}} >
         <View style={{width: 1, height: 10, backgroundColor: item.color}} />
<View style={{height:27,width:300,flexDirection:'row'}}>
         <View style={{width: 60, height: 10, backgroundColor: item.color}} />
 <Image style={{height:27,width:27,tintColor:darkColor[item.nameNumber]}} source={icons[item.nameNumber]} />
                <Text style={{ fontWeight:'bold', fontSize: 16,color:brightColor[item.nameNumber] }}>
         { animalNames[item.nameNumber] }
           </Text>
</View>
           <Text style={{ fontFamily: 'JosefinSans-Regular.ttf', fontSize: 18,color:'#696969' }}>
          commented on a post:
           </Text>
        <Text style={{ fontSize: 16 }} numberOfLines={1}>
          { item.content }
           </Text>
         <View style={{width: 1, height: 10, backgroundColor: item.color}} />
</View>
</TouchableWithoutFeedback>
<View style={{width: 70, height: this.state.postWidth, backgroundColor: item.color,  alignItems: 'center', justifyContent: 'center', paddingLeft: 10, paddingRight:30}} >
         <View style={{width: 1, height: 3, backgroundColor: item.color}} />
            <Image source={require('./CandidtwoImages/comments.png')} style={{width: 30,height: 30,tintColor: '#A9A9A9'}}/>
         <View style={{width: 1, height: 27, backgroundColor: item.color}} />
</View>
     </View>
    <View style={{width: this.state.postWidth, height: 1, backgroundColor: 'grey'}} />
    </View>
  }
/>
       
<View style={{width: 1, height: 6, backgroundColor: '#e8e8e8'}} />
<TouchableWithoutFeedback onPress={()=>{
  this.props.navigation.navigate('Settings')
}}>
      <Image source={require('./CandidtwoImages/settings.png')} style={{width: 50,height: 50,tintColor:'#FF8345'}}/>
</TouchableWithoutFeedback>
  <View style={{width: parseInt(this.state.postWidth), height: 15, backgroundColor: '#e8e8e8'}}>
    <Text style={{fontSize: 22, color: '#e8e8e8', textAlign: 'center'}}>
   ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
    </Text>
      </View>
</ScrollView>
<View>
         <View style={{width: this.state.postWidth, height: 50, backgroundColor: '#f9f9f9',alignItems:'center',justifyContent:'space-between',flexDirection:'row'}}>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Feed')}}>
<View style={{ height:50,width:50,backgroundColor:'#f9f9f9',alignItems:'center'}}>
        <Image style={{width:25,height:25,tintColor:'#929292'}}source={require('./CandidtwoImages/feedtab.png')}/>
 <Text style={{ fontSize: 12,color:'#929292' }}>
               Feed
            </Text>
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Groups')}}>
<View style={{ height:50,width:50,backgroundColor:'#f9f9f9',alignItems:'center'}}>
        <Image style={{width:25,height:25,tintColor:'#929292'}}source={require('./CandidtwoImages/starTab.png')}/>
 <Text style={{ fontSize: 12,color:'#929292' }}>
               Groups
            </Text>
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Post')}}>
<View elevation={2} style={{ shadowOpacity:0.5,shadowRadius:2,borderRadius:50/2, height:50,width:50,backgroundColor:'white',alignItems:'center'}}>
        <Image style={{width:26,height:26,tintColor:'#2d2d2d'}}source={require('./CandidtwoImages/plus.png')}/>
 <Text style={{ fontSize: 15,color:'#2d2d2d',fontWeight:'bold' }}>
                Post
            </Text>
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Chats')}}>
<View style={{ height:50,width:50,backgroundColor:'#f9f9f9',alignItems:'center'}}>
        <Image style={{width:24,height:26,tintColor:'#929292'}}source={require('./CandidtwoImages/mail.png')}/>
 <Text style={{ fontSize: 12,color:'#929292' }}>
               Chats
            </Text>
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Notifs')}}>
<View style={{ height:50,width:50,backgroundColor:'white',alignItems:'center'}}>
{this.state.notifs != 0 &&
  <View style={{backgroundColor:'red',height:14,width:14,borderRadius:9/2,justifyContent:'center',alignItems:'center'}}>
     <Text style={{ fontSize: 10,color:'white' }}>
               {this.state.notifs}
            </Text>
  </View>
}
        <Image style={{width:27,height:27,tintColor:'#fe8200'}}source={require('./CandidtwoImages/NotificationIcon.png')}/>
{this.state.notifs == 0 &&
     <Text style={{ fontSize: 14,color:'black' }}>
           You  
     </Text>
}
</View>  
</TouchableHighlight>
</View>
 <View style={{width: parseInt(this.state.postWidth), height: 1, backgroundColor: '#f9f9f9'}}>
    <Text style={{fontSize: 22, color: '#e8e8e8', textAlign: 'center'}}>
   ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
    </Text>
      </View>
</View>
</View>) : (null) }
</View>
    )
  }
}
class Groups extends React.Component {
static navigationOptions = {
    header:null,
    tabBarVisible:false,
    tabBarIcon: () => (
      <Image
        source={require('./CandidtwoImages/starTab.png')}
        style={[styles.icon, {tintColor: '#A9A9A9'}]}
      />
    ),
  };
    state = {
      fontLoaded: false,
    };
   _onRefresh() {
    this.setState({refreshing: true});
    this.getItems()
  }
getItems(){
this.setState({firebaseItems: [' ']})
var query = firebase.database().ref('groups').orderByKey();
query.once('value', (snap) => {
  var items = [];
  snap.forEach((child) => {
    items.push({
      name: child.val().name,
      des: child.val().des,
      users: child.val().users,
      posts: child.val().posts,
      joined: child.val().joined,
      key: child.key,
    });
  })
items.sort(function(a, b) {return b.users - a.users});
this.setState({items:items})
}).then(()=>{
var query2 = firebase.database().ref('users/'+expoID+'/groups').orderByKey();
query2.once('value', (snap) => {
  var myGroups = [];
  snap.forEach((child) => {
    myGroups.push({
      name: child.val().name,
    });
  })
this.setState({myGroups:myGroups})
}).then(()=>{
var items2 = this.state.items;
var myGroups2 = this.state.myGroups;
    for (i = 0; i < items2.length; i++) {
       for (k = 0; k < myGroups2.length; k++) {
          if (items2[i].name == myGroups2[k].name){
             items2[i].joined = 'yes';
             break;
  }
 }
}
this.setState({firebaseItems: items2});
this.setState({refreshing:false});
})
})
}
async componentDidMount() {
    await Font.loadAsync({
      'JosefinSans-Regular.ttf': require('./JosefinSans-Regular.ttf'),
    });
    this.setState({ fontLoaded: true });
    this.getItems();
  }
render() {
  return(
<View style={styles.container}>
   {this.state.fontLoaded ? (
<View style={styles.container}>
<ScrollView refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />}>
<View style={{paddingRight:5,paddingLeft:5}}>
 <View style={{width: parseInt(this.state.postWidth), height: 30, backgroundColor: '#e8e8e8'}}>
    <Text style={{fontSize: 22, color: '#e8e8e8', textAlign: 'center'}}>
   ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
    </Text>
      </View>
<TouchableHighlight onPress={() => {
this.props.navigation.navigate('createGroup')
}}>
<View style={{
width:this.state.postWidth,height:60,backgroundColor:'grey',alignItems:'center',justifyContent:'center',flexDirection:'row',borderRadius:10}}>
<View style={{
width:50,height:50,borderRadius:50/2,backgroundColor:'#fe8200',alignItems:'center',justifyContent:'center'}}>
        <Image style={{width:27,height:27,tintColor:'white',paddingBottom:10}}source={require('./CandidtwoImages/plus.png')}/>
</View>
<View style={{width:6,height:1}}/>
<Text style={{ fontWeight:'bold',fontSize: 18,color: '#ffffff'}}>
Create a new group
</Text>
</View>
</TouchableHighlight>
<View style={{width:1,height:6}}/>
<FlatList
  data={this.state.firebaseItems}
  renderItem={({item}) =>
<View>
 <TouchableWithoutFeedback onPress={() => { this.props.navigation.navigate('groupView',{group:item.name})}}>
    <View style={{width: this.state.postWidth,height:300,backgroundColor:"#ffc26d",borderRadius:10,paddingTop:10,paddingBottom:10,alignItems:'center',justifyContent:'center'}}>
      <Text style={{ fontWeight:'bold',fontSize: 22,color: '#2d2d2d',paddingBottom:20}}numberOfLines={1}>
{item.name}
</Text>
    <Text style={{ fontSize: 16,color: '#2d2d2d',paddingBottom:20}} numberOfLines={6}>
{item.des}
</Text>
<View style={{flexDirection:'row'}}>
<Text style={{ fontSize: 11,color: '#2d2d2d',paddingRight:20}} numberOfLines={6}>
{item.users} {' '}users
</Text>
<Text style={{ fontSize: 11,color: '#2d2d2d'}} numberOfLines={6}>
{item.posts}{' '} posts
</Text>
</View>
<View style={{width:1,height:20}}/>
{item.joined == 'no' &&
<Button
      style={{justifyContent: 'center'}}
      onPress={() => {
    firebase.database().ref('users/'+expoID+'/groups').push().set({
           name: item.name,
       des: item.des,
           key: item.key,
        });
    firebase.database().ref('groups/'+item.key).update({
    users: item.users+1
    })
    this.getItems();
      }}               
      title="Join"
      color="#fe8200"
    />
}
{item.joined == 'yes'&&
      <Text style={{ fontWeight:'bold',fontSize: 22,color: '#2c2c2c'}}>
    You are already in this group.
      </Text>
}
    </View>
</TouchableWithoutFeedback>
<View style={{width:1,height:6}}/>
</View>
}
/>
</View>
</ScrollView>
<View>
         <View style={{width: this.state.postWidth, height: 50, backgroundColor: '#f9f9f9',alignItems:'center',justifyContent:'space-between',flexDirection:'row'}}>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Feed')}}>
<View style={{ height:50,width:50,backgroundColor:'#f9f9f9',alignItems:'center'}}>
        <Image style={{width:25,height:25,tintColor:'#929292'}}source={require('./CandidtwoImages/feedtab.png')}/>
 <Text style={{ fontSize: 12,color:'#929292' }}>
               Feed
            </Text>
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Groups')}}>
<View style={{ height:50,width:50,backgroundColor:'white',alignItems:'center'}}>
        <Image style={{width:27,height:27,tintColor:'#fe8200'}}source={require('./CandidtwoImages/starTab.png')}/>
 <Text style={{ fontSize: 14,color:'black' }}>
               Groups
            </Text>
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Post')}}>
<View elevation={2} style={{ shadowOpacity:0.5,shadowRadius:2,borderRadius:50/2, height:50,width:50,backgroundColor:'white',alignItems:'center'}}>
        <Image style={{width:26,height:26,tintColor:'#2d2d2d'}}source={require('./CandidtwoImages/plus.png')}/>
 <Text style={{ fontSize: 15,color:'#2d2d2d',fontWeight:'bold' }}>
                Post
            </Text>
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Chats')}}>
<View style={{ height:50,width:50,backgroundColor:'#f9f9f9',alignItems:'center'}}>
        <Image style={{width:24,height:26,tintColor:'#929292'}}source={require('./CandidtwoImages/mail.png')}/>
 <Text style={{ fontSize: 12,color:'#929292' }}>
               Chats
            </Text>
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Notifs')}}>
<View style={{ height:50,width:50,backgroundColor:'#f9f9f9',alignItems:'center'}}>
        <Image style={{width:25,height:25,tintColor:'#929292'}}source={require('./CandidtwoImages/NotificationIcon.png')}/>
 <Text style={{ fontSize: 12,color:'#929292' }}>
               You
            </Text>
</View>  
</TouchableHighlight>
</View>
 <View style={{width: parseInt(this.state.postWidth), height: 1, backgroundColor: '#f9f9f9'}}>
    <Text style={{fontSize: 22, color: '#e8e8e8', textAlign: 'center'}}>
   ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
    </Text>
      </View>
</View>
</View>
   ) : (null) }
</View>
  )
 }
}
class newGroup extends React.Component {
constructor(props) {
    super(props);
    this.state = {
      name: "",
      des: "",
   }
 }
render() {
 const {goBack} = this.props.navigation;
  return(
<View style={{alignItems:'center'}}>
<View style={{width:1,height:6}}/>
            <TextInput
                 style={{height:40, width: 260, borderRadius:7,paddingRight:7,paddingLeft:7,backgroundColor:'#D3D3D3'}}
         onChangeText={(name)=>this.setState({name})}
                 value={this.state.name}   
                 autoCorrect={true}
              underlineColorAndroid={'#D3D3D3'}
              autoCapitalize={('sentences')}
               placeholder={"Name your group"}
           autoFocus={true}
               placeholderTextColor={'#696969'}
             />
<View style={{width:1,height:6}}/>
            <TextInput
                 style={{height:100, width: 260, borderRadius:7,paddingRight:7,paddingLeft:7,backgroundColor:'#D3D3D3'}}
         onChangeText={(des)=>this.setState({des})}
                 value={this.state.des}   
        multiline={true}
              underlineColorAndroid={'#D3D3D3'}
              autoCapitalize={('sentences')}
               placeholder={"Give it a description"}
           autoFocus={true}
               placeholderTextColor={'#696969'}
             />
 <View style={{width:1,height:6}}/>
 <Button
      style={{justifyContent: 'center'}}
      onPress={() => {
Keyboard.dismiss()
var groupref = firebase.database().ref('groups').push();
        if (this.state.name.length!=0 && this.state.des.length!=0) {
        groupref.set({
           name: this.state.name,
       des: this.state.des,
       users: 0,
       posts: 0,
       joined: 'no',
        });
        goBack(null);
    }
    else {
        if (this.state.name.length==0){
          Alert.alert("Add a name before creating your group.")
        }
        if (this.state.des.length==0){
          Alert.alert("Add a description before creating your group.")
        }
    }
      }}               
      title="Create"
      color='#f7961d'
    />
</View>
)
}
}
class PostScreen extends React.Component {
constructor(props) {
    super(props);
    this.state = {
      postInput: "",
      time: Date.now(),
      imagebsf: ' ',
      imageWidth: 0,
      imageHeight: 0,
   }
 }
    state = {
      fontLoaded: false,
      image: null,
    };
getItems(){
var query = firebase.database().ref('users/' + expoID + '/groups').orderByKey();
query.once('value', (snap) => {
  var items = [];
  snap.forEach((child) => {
    items.push({
      name: child.val().name,
      key: child.val().key,
    });
  });
  items.reverse();
  this.setState({ firebaseItems: items });
})
}
async componentDidMount() {
    await Font.loadAsync({
      'JosefinSans-Regular.ttf': require('./JosefinSans-Regular.ttf'),
    });
    this.setState({ fontLoaded: true });
    this.setState({ group: 'random',groupkey: '-L30bsfNU0fX_NMhVZir' })
    this.getItems();
  }
post(){
    var postRef = firebase.database().ref('posts/'+this.state.group+'/posts').push();
    postRef.set({
    content:this.state.postInput,
    userNameId:expoNameIDConst,
    userID: expoID,
    newestComment: ' ',
    comments: 0,
    likes: 0,
    dislikes: 0,
    group: this.state.group,
    time:this.state.time,
    image: this.state.imagebsf,
    imageW: this.state.imageWidth,
    imageH: this.state.imageHeight,
    });
    this.setState({postInput:''});
}
render() {
 let { image } = this.state;
 const {goBack} = this.props.navigation;
  return(
          <View style={styles.postcontainer}>
{this.state.fontLoaded ? (          <View style={styles.postcontainer}>
 <ScrollView>
   <View style={{width: 1, height: 6}} />
 <Text style={{ fontWeight: 'bold', fontSize: 18,color:'black' }}>
        What's on your mind? Add the content of your post:
            </Text>  
    <TextInput
                 style={{height:150, width: this.state.postWidth, borderColor: '#e8e8e8', borderWidth:2,borderRadius:7,paddingRight:7,paddingLeft:7,backgroundColor:'#f9f9f9'}}
                 onChangeText={(postInput)=>this.setState({postInput})}
                 value={this.state.postInput}  
              onSubmitEditing={Keyboard.dismiss}
             autoCorrect={true}
             underlineColorAndroid={'#f9f9f9'}
             autoCapitalize={('sentences')}
             placeholderTextColor={'#D3D3D3'}
             autoFocus={true}
             multiline={true}
             />
<View style={{width: parseInt(this.state.postWidth), height: 8, backgroundColor: '#ffffff'}}>
    <Text style={{fontSize: 22, color: '#ffffff', textAlign: 'center'}}>
   ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
    </Text>
      </View>
 <View style={{width: 2500, height: 1, backgroundColor: 'grey'}} />
   <View style={{width: 1, height: 6}} />
 <Text style={{ fontWeight: 'bold', fontSize: 18,color:'black' }}>
                Add an image:
            </Text>  
<TouchableHighlight onPress={this._pickImage}>
        <Image style={{width:50,height:50}}source={require('./CandidtwoImages/addImage.png')}/>
    </TouchableHighlight>
<View style={{height:6,width:1}}/>
{image && <Image source={{ uri: image }} style={{ width: 200, height: 267 }} />}
   <View style={{width: 1, height: 6}} />
 <View style={{width: 2500, height: 1, backgroundColor: 'grey'}} />
   <View style={{width: 1, height: 6}} />
 <Text style={{ fontWeight:'bold', fontSize: 18,color:'black' }}>
                Select a group:
            </Text>  
   <View style={{width: 1, height: 3}} />
 <View style={{height:20,width:500,flexDirection:'row'}}>
 <Text style={{ fontFamily: 'JosefinSans-Regular.ttf', fontSize: 18,color:'#f7961d' }}>
                Group selected: {' '}
            </Text>  
 <Text style={{ fontFamily: 'JosefinSans-Regular.ttf', fontSize: 18,color:'#2d2d2d' }}>
                 {this.state.group}
            </Text>  
</View>
   <View style={{width: 1, height: 6}} />
               <FlatList style={{backgroundColor:'#e8e8e8',paddingRight:4,paddingLeft:4}}
  data={this.state.firebaseItems}
  renderItem={({item}) =>
<View>
    <View style={{width: this.state.postWidth,height:80,backgroundColor:"#ffc26d",paddingTop:10,paddingBottom:10,alignItems:'center',justifyContent:'center'}}>
      <Text style={{ fontWeight:'bold',fontSize: 16,color: '#2d2d2d',paddingBottom:20}}numberOfLines={1}>
{item.name}
</Text>
    
<Button
      style={{justifyContent: 'center'}}
      onPress={() => {
       this.setState({group:item.name,groupkey:item.key})
      }}               
      title="Select"
      color="#fe8200"
    />
    </View>
<View style={{width:2500,height:1,backgroundColor:'#2d2d2d'}}/>
</View>
}
/>
   <View style={{width: 1, height: 6}} />
 <View style={{width: 2500, height: 1, backgroundColor: 'grey'}} />
   <View style={{width: 1, height: 20}} />
 
 <Button
      style={{justifyContent: 'center'}}
      onPress={() => {
Keyboard.dismiss()
        if (this.state.postInput.length>0) {
        if(1001>this.state.postInput.length){
        this.post();
        firebase.database().ref('groups/'+this.state.groupkey).once("value", dataSnapshot => {
           posts = dataSnapshot.val().posts
        }).then(()=>{
           firebase.database().ref('groups/'+this.state.groupkey).update({posts: posts+1})
        })
        goBack(null);
    }
        else{
            Alert.alert("Please keep your post to a max of 1000 characters.")
        }   
    }
    else {
        if (this.state.postInput.length==0){
          Alert.alert("Add some content before you post please.")
        }
    }
      }}               
      title="Post"
      color='#f7961d'
    />
<View style={{width:1,height:400}} />
 </ScrollView>
</View>) : (null) }
</View>
  )
 }
  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      MediaTypeOptions: 'Images',
      quality: 0.08,
      base64:true,
    });
if (result.base64.toString().length > 120000){
  Alert.alert("Sorry, this image is too big. Try a smaller image")
} else {
      this.setState({ image: result.uri });
      this.setState({ imagebsf: result.base64.toString() });
      this.setState({ imageWidth: result.width });
      this.setState({ imageHeight: result.height });
}
  };
}
class Chats extends React.Component {
   _onRefresh() {
    this.setState({refreshing: true});
    this.getItems()
  }
  static navigationOptions = {
    header:null,
    tabBarVisible:false,
    tabBarIcon: () => (
      <Image
        source={require('./CandidtwoImages/mail.png')}
        style={[styles.icon, {tintColor: '#A9A9A9'}]}
      />
    ),
  };
async componentDidMount() {
    await Font.loadAsync({
      'JosefinSans-Regular.ttf': require('./JosefinSans-Regular.ttf'),
    });
    this.setState({ fontLoaded: true });
  }
 state = {fontLoaded: false,chats:0};
  componentWillMount(){
    this.getItems();
 }
getItems(){
var query = firebase.database().ref('users/' + expoID + '/chats').orderByKey();
query.once('value', (snap) => {
  var items = [];
  snap.forEach((child) => {
    items.push({
      postKey: child.val().okey,
      expoID: child.val().otherID,
      opl: child.val().opl,
      nameID: child.val().nameID,
      name: child.val().name,
      newestMessage: child.val().newestMessage,
      color: child.val().color,
      key: child.key,
      group: child.val().group,
      time: child.val().time,
    });
  });
  items.sort(function(a, b) {return b.time - a.time});
  this.setState({ firebaseItems: items });
  this.setState({refreshing: false});
 var chats = 0;
     for (i = 0; i < items.length; i++) {
       if (items[i].color == '#ffc7a5') {
    chats++
       }
     }
     this.setState({chats:chats})
});
 }
 render() {
    return (
      <View style={styles.container}>
{this.state.fontLoaded ? (
      <View style={styles.container}>
<View style={{backgroundColor:'white'}}>
<View style={{width: 3, height: 25, backgroundColor: '#e8e8e8'}}></View>
   <Text style={{ fontFamily: 'JosefinSans-Regular.ttf', fontSize:20,paddingRight:5,paddingLeft:5,paddingTop:3,paddingBottom:3 }}>
     Chat with users here
   </Text>
   <Text style={{ fontSize:14,paddingRight:5,paddingLeft:5,paddingTop:3,paddingBottom:3 }}>
      If a chat is highlighted, that means you have a new message in that chat
   </Text>
</View>
 <ScrollView  refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />
        }>
 <View style={{width: 1, height: 6, backgroundColor: '#e8e8e8'}} />
    <View style={{width: this.state.postWidth, height: 1, backgroundColor: 'grey'}} />
<FlatList
  data={this.state.firebaseItems}
  renderItem={({item}) =>
    <View>
<TouchableWithoutFeedback onPress={() => {
        this.props.navigation.navigate('Chat',{postKey: item.postKey, userID: item.expoID,opl: item.opl,nameID:item.nameID,group:item.group,name:item.name})
    firebase.database().ref('users/'+expoID+'/chats/'+item.key).update({
       color: '#e8e8e8',
        })
    this.getItems();
      }}>             
<View style={{width: parseInt(this.state.postWidth), height: this.state.postWidth, backgroundColor: item.color,  alignItems: 'center', justifyContent: 'center', paddingLeft: 10, paddingRight:10}} >
         <View style={{width: 1, height: 10, backgroundColor: item.color}} />
    <View style={{flexDirection:'row'}}>
           <Text style={{ fontFamily: 'JosefinSans-Regular.ttf', fontSize: 18,color:'#696969' }}>
          Chat with {' '}
           </Text>
          <Text style={{
            fontSize: 16,
            color: brightColor[Math.floor((item.opl/10)+(item.nameID * 2))],
            fontWeight: 'bold'
          }}>
          {item.name}
          </Text>
    </View>
           <Text style={{ fontSize: 15,color:'black' }}numberOfLines={2}>
          { item.newestMessage }
           </Text>
         <View style={{width: 1, height: 10, backgroundColor: item.color}} />
</View>
</TouchableWithoutFeedback>
    <View style={{width: this.state.postWidth, height: 1, backgroundColor: 'grey'}} />
    </View>
  }
/>
  <View style={{width: parseInt(this.state.postWidth), height: 15, backgroundColor: '#e8e8e8'}}>
    <Text style={{fontSize: 22, color: '#e8e8e8', textAlign: 'center'}}>
   ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
    </Text>
      </View>
</ScrollView>
<View>
         <View style={{width: this.state.postWidth, height: 50, backgroundColor: '#f9f9f9',alignItems:'center',justifyContent:'space-between',flexDirection:'row'}}>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Feed')}}>
<View style={{ height:50,width:50,backgroundColor:'#f9f9f9',alignItems:'center'}}>
        <Image style={{width:25,height:25,tintColor:'#929292'}}source={require('./CandidtwoImages/feedtab.png')}/>
 <Text style={{ fontSize: 12,color:'#929292' }}>
               Feed
            </Text>
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Groups')}}>
<View style={{ height:50,width:50,backgroundColor:'#f9f9f9',alignItems:'center'}}>
        <Image style={{width:25,height:25,tintColor:'#929292'}}source={require('./CandidtwoImages/starTab.png')}/>
 <Text style={{ fontSize: 12,color:'#929292' }}>
               Groups
            </Text>
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Post')}}>
<View elevation={2} style={{shadowOpacity:0.5,shadowRadius:2,borderRadius:50/2, height:50,width:50,backgroundColor:'white',alignItems:'center'}}>
        <Image style={{width:26,height:26,tintColor:'#2d2d2d'}}source={require('./CandidtwoImages/plus.png')}/>
 <Text style={{ fontSize: 15,color:'#2d2d2d',fontWeight:'bold' }}>
                Post
            </Text>
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Chats')}}>
<View style={{ height:50,width:50,backgroundColor:'white',alignItems:'center'}}>
{this.state.chats != 0 &&
  <View style={{backgroundColor:'red',height:14,width:14,borderRadius:9/2,justifyContent:'center',alignItems:'center'}}>
     <Text style={{ fontSize: 10,color:'white' }}>
               {this.state.chats}
            </Text>
  </View>
}
        <Image style={{width:26,height:28,tintColor:'#fe8200'}}source={require('./CandidtwoImages/mail.png')}/>
{this.state.chats == 0 &&
 <Text style={{ fontSize: 14,color:'black' }}>
               Chats
            </Text>
}
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Notifs')}}>
<View style={{ height:50,width:50,backgroundColor:'#f9f9f9',alignItems:'center'}}>
        <Image style={{width:25,height:25,tintColor:'#929292'}}source={require('./CandidtwoImages/NotificationIcon.png')}/>
 <Text style={{ fontSize: 12,color:'#929292' }}>
               You
            </Text>
</View>  
</TouchableHighlight>
</View>
 <View style={{width: parseInt(this.state.postWidth), height: 1, backgroundColor: '#f9f9f9'}}>
    <Text style={{fontSize: 22, color: '#e8e8e8', textAlign: 'center'}}>
   ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
    </Text>
      </View>
</View>
</View>) : (null) }
</View>
    )
  }
}
//New Section
class chat extends React.Component {
    state = {
      fontLoaded: false,
    };
     _onRefresh() {
    this.setState({refreshing: true});
    this.getItems()
  }
 constructor(props) {
      super(props);
      const { params } = props.navigation.state;
    this.state = {
      postKey: params.postKey,
      userID: params.userID,
      opl: params.opl,
      nameID: params.nameID,
      messageInput: "",
      nameInput: "",
      group: params.group,
      addingName: false,
      name: params.name,
      firebaseItems:[],
    };
}
async componentDidMount() {
    await Font.loadAsync({
      'JosefinSans-Regular.ttf': require('./JosefinSans-Regular.ttf'),
    });
    this.setState({fontLoaded:true})
    this.getItems();
  }
getItems(){
var users = [expoID,this.state.userID]
users.sort();
     var query = firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.postKey+ '/chats/' + users[0] +'+'+ users[1]+'/messages').orderByKey();
        query.once('value', (snap) => {
        var items = [];
  snap.forEach((child) => {
    items.push({
      content: child.val().content,
      expoID: child.val().expoID,
      nameID: child.val().nameID,
      time: child.val().time,
    });
  })
  this.setState({ firebaseItems: items });
  this.setState({refreshing: false});
});
 
}
timestamp(datePosted){
var timeStamp = 'error occured';
var secondsBtwn = Math.floor((Date.now() - datePosted)/1000);
if (secondsBtwn > 31536000){
        timeStamp = Math.floor(secondsBtwn/31536000) + ' years';
    }else if (secondsBtwn >= 2592000){
        timeStamp = Math.floor(secondsBtwn/2592000) + ' months';
    }else if (secondsBtwn >= 604800){
        timeStamp = Math.floor(secondsBtwn/604800) + ' weeks';
    }else if (secondsBtwn >= 86400){
        timeStamp = Math.floor(secondsBtwn/86400) + ' days';
    }else if (secondsBtwn >= 3600){
        timeStamp = Math.floor(secondsBtwn/3600) + ' hours';
    }else if (secondsBtwn >= 60){
        timeStamp = Math.floor(secondsBtwn/60) + ' minutes';
    }else{
        timeStamp = Math.floor(secondsBtwn) + ' seconds';
    }
Alert.alert("Message was sent "+timeStamp +" ago.");
}
send(content){
var users = [expoID,this.state.userID]
users.sort();
var createNew = 'yes';
firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.postKey+ '/chats/' + users[0] +'+'+ users[1]).once('value', function(snapshot) {
  if (snapshot.exists()) {
   createNew = 'no';
  }
}).then(()=>{
   if (createNew == 'yes') {
   firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.postKey+ '/chats/' + users[0] +'+'+ users[1]).update({ uselessplaceholder: '0' })
   this.sendChatMessage(users[0],users[1]);
   }
    firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.postKey+'/chats/'+ users[0] + '+' + users[1]+'/messages').push().set({
      content: content,
      expoID: expoID,
      nameID: Expo.Constants.deviceName.length + Expo.Constants.deviceYearClass-2005,
      time: Date.now(),
     })
 if (expoID==users[0]){
  firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.postKey+ '/chats/' + users[0] +'+'+ users[1]).once('value', function(snapshot) {
    messageKey = snapshot.val().userTwoKey
  }).then(()=>{
firebase.database().ref('users/'+users[1]+'/chats/'+messageKey).update({
       newestMessage: content,
       color: '#ffc7a5',
       time: Date.now(),
        })
 })} else {
firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.postKey+ '/chats/' + users[0] +'+'+ users[1]).once('value', function(snapshot) {
    messageKey = snapshot.val().userOneKey
  }).then(()=>{
firebase.database().ref('users/'+users[0]+'/chats/'+messageKey).update({
       newestMessage: content,
       color: '#ffc7a5',
       time: Date.now(),
     })
 })}
this.getItems();
})
}

updateName(newName){
var users = [expoID,this.state.userID]
users.sort();
if (expoID==users[0]){
  firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.postKey+ '/chats/' + users[0] +'+'+ users[1]).once('value', function(snapshot) {
    messageKey = snapshot.val().userTwoKey
  }).then(()=>{
firebase.database().ref('users/'+users[1]+'/chats/'+messageKey).update({
       name: newName
        })
 })} else {
firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.postKey+ '/chats/' + users[0] +'+'+ users[1]).once('value', function(snapshot) {
    messageKey = snapshot.val().userOneKey
  }).then(()=>{
firebase.database().ref('users/'+users[0]+'/chats/'+messageKey).update({
        name: newName
     })
 })
}
}

sendChatMessage(userone,usertwo){
var myMessageRef = firebase.database().ref('users/'+expoID+'/chats').push();
var myKey = myMessageRef.key;
var theirMessageRef =  firebase.database().ref('users/'+this.state.userID+'/chats').push();
var theirKey = theirMessageRef.key;
myMessageRef.set({
       okey: this.state.postKey,
       otherID: this.state.userID,
       opl: this.state.opl,
       nameID:this.state.nameID,
       name:animalNames[Math.floor(this.state.nameID*2+this.state.opl/10)],
       group:this.state.group,
       time: Date.now(),
        }).then(()=>{
theirMessageRef.set({
      okey: this.state.postKey,
      otherID: expoID,
      opl: this.state.opl,
      nameID:Expo.Constants.deviceName.length + Expo.Constants.deviceYearClass-2005,
      name:animalNames[ Math.floor((Expo.Constants.deviceName.length + Expo.Constants.deviceYearClass-2005)*2+this.state.opl/10)],
      group: this.state.group,
      time: Date.now(),
        })})
if (expoID == userone){
   firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.postKey+ '/chats/' + userone +'+'+ usertwo).update({ userOneKey: myKey })
   firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.postKey+ '/chats/' + userone +'+'+ usertwo).update({ userTwoKey: theirKey })
} else {
   firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.postKey+ '/chats/' + userone +'+'+ usertwo).update({ userTwoKey: myKey })
   firebase.database().ref('posts/'+this.state.group+'/posts/'+this.state.postKey+ '/chats/' + userone +'+'+ usertwo).update({ userOneKey: theirKey })
}
}
render() {
    const { params } = this.props.navigation.state;
  return(
<View style={styles.containerw}>
   {this.state.fontLoaded ? (
<View style={styles.containerw}>
<View style={{width: 2500, height: 25, backgroundColor: '#f4f4f4',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
<Text style={{ fontSize: 18,fontFamily: 'JosefinSans-Regular.ttf' }}>
                Send messages to {' '}
            </Text>  
   <Text style={{
            fontSize: 16,
            color: brightColor[Math.floor((this.state.opl/10)+(this.state.nameID * 2))],
            fontWeight: 'bold'
          }}>
          { this.state.name }
          </Text>
</View>
<View style={{width: 2500, height: 40, backgroundColor: '#f4f4f4',flexDirection:'row',justifyContent:'center'}}>
            <TextInput
                 style={{height:40, width: 260, borderRadius:7,paddingRight:7,paddingLeft:7,backgroundColor:'#D3D3D3'}}
         onChangeText={(messageInput)=>this.setState({messageInput})}
                 value={this.state.messageInput}   
                 autoCorrect={true}
              underlineColorAndroid={'#D3D3D3'}
              autoCapitalize={('sentences')}
               placeholder={"Send a message"}
           autoFocus={true}
               placeholderTextColor={'#696969'}
             />
<View style={{width: 5, height: 3, backgroundColor:'#f4f4f4'}}></View>
<Button
      style={{justifyContent: 'center'}}
      onPress={() => {  
Keyboard.dismiss()
        if (this.state.messageInput.length>0) {
     this.send(this.state.messageInput);
     this.setState({messageInput:''})
    }
    else {    
        Alert.alert("Please add some content before sending a message.")
    }
   
      }}               
      title=" Send "
      color="#fe8200"
    />
 </View>
<View style={{width: 2500, height: 3, backgroundColor: '#f4f4f4'}}></View>

{this.state.firebaseItems.length > 3 &&
<TouchableHighlight onPress={() => {
this.setState({addingName:true})
}}>
<View style={{width: 2500, height: 30, backgroundColor: '#e2525b',justifyContent:'center',alignItems:'center'}}>
<Text style={{color:'white',fontFamily:'JosefinSans-Regular.ttf'}}>
Edit your name
</Text>
</View>
</TouchableHighlight>
}

{this.state.addingName &&
<View style={{width: 2500, height: 40, backgroundColor: '#e2525b',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
            <TextInput
                 style={{height:30, width: 150, borderRadius:10,paddingRight:7,paddingLeft:7,backgroundColor:'white'}}
         onChangeText={(nameInput)=>this.setState({nameInput})}
                 value={this.state.nameInput}   
                 autoCorrect={true}
              underlineColorAndroid={'white'}
              autoCapitalize={('sentences')}
               placeholder={"Give yourself a nickname"}
           autoFocus={false}
               placeholderTextColor={'#696969'}
             />
<View style={{width: 5, height: 3}}></View>
<Button
      style={{justifyContent: 'center'}}
      onPress={() => {  
Keyboard.dismiss()
        if (this.state.nameInput.length>0) {
     this.updateName(this.state.nameInput);
     this.setState({nameInput:''})
     this.setState({addingName:false})
    }
    else {    
        Alert.alert("Please add some text to your name.")
    }
      }}               
      title="Done"
      color="#58c493"
    />
 </View>
}

<ScrollView style={{paddingLeft:5,paddingRight:5,backgroundColor:'white'}} refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />
        }>
      <View style={{paddingLeft: 5, paddingRight:5}}>
 <View style={{width: 1, height: 6, backgroundColor: 'white'}} />
<FlatList
  data={this.state.firebaseItems}
  renderItem={({item}) =>
   <View>
    { expoID == item.expoID && <View style={{flexDirection:'row'}}>    
<View style={{width:60}}/>     
<TouchableHighlight onPress={() => {this.timestamp(item.time);}}>
<View style={{width: iWidth-70, height: this.state.postWidth, backgroundColor: "#f7961d", paddingLeft: 10, paddingRight:10,borderRadius:8,paddingTop:4,paddingBottom:4}}>
        <Text style={{ fontSize: 16,color:'white',paddingTop:5,paddingBottom:5 }}>
          { item.content }
           </Text>
</View>
</TouchableHighlight>
    </View>}
    
    { expoID != item.expoID && <View>    
<TouchableHighlight onPress={() => {this.timestamp(item.time);}}>
<View style={{flexDirection:'row'}}>
<View style={{
    width: 24,
    height: 24,
    borderRadius: 24/2,
    backgroundColor: 'white'
}}>
<Image style={{height:27,width:27,tintColor:darkColor[Math.floor((this.state.opl/10)+(this.state.nameID * 2))]}} source={icons[Math.floor((this.state.opl/10)+(this.state.nameID * 2))]} />
</View>
<View style={{width:4}}/>     
<View style={{width: iWidth-70, height: this.state.postWidth, backgroundColor: "#dddddd", paddingLeft: 10, paddingRight:10,borderRadius:8,paddingTop:4,paddingBottom:4}} >
        <Text style={{ fontSize: 16,color: '#848484',paddingTop:5,paddingBottom:5 }}>
          { item.content }
           </Text>
</View>
</View>
</TouchableHighlight>
    </View>}
    <View style={{width:1, height: 6, backgroundColor: 'white'}} />
</View>  
}
/>
<View style={{width: parseInt(this.state.postWidth), height: 350, backgroundColor: 'white'}}>
    <Text style={{fontSize: 22, color: 'white', textAlign: 'center'}}>
   ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
    </Text>
      </View>
</View>
</ScrollView>
</View>
) : (null) }
</View>
)}
}
class GroupView extends React.Component {
 
  state = {
    fontLoaded: false,
  };
 
  async componentDidMount() {
    await Font.loadAsync({
      'JosefinSans-Regular.ttf': require('./JosefinSans-Regular.ttf'),
    });
    this.getItems();
    this.setState({ fontLoaded: true });
  }
 
  constructor(props) {
    super(props);
    const { params } = props.navigation.state;
    this.state = {
    refreshing: false,
    numOfPosts: 20,
    group: params.group,
    firebaseItems: [' '],
    }
 }
  getItems(){
   var items = [];
   firebase.database().ref('posts/'+this.state.group+'/posts').limitToLast(
          this.state.numOfPosts
     ).orderByKey().once ('value', (snap) => {
      snap.forEach ( (child) => {       
       items.push({
         content: child.val().content,
         key: child.key,
         nameID: child.val().userNameId,
         userID: child.val().userID,
         commentPreview: child.val().newestComment,
         comments: child.val().comments,
         likes: child.val().likes,
         dislikes: child.val().dislikes,
         group: child.val().group,
         time: child.val().time,
         image: child.val().image,
         imageW: child.val().imageW,
         imageH: child.val().imageH,
     });
     });
 for (i = 0; i < items.length; i++) {
var timeStamp = 'error';
var secondsBtwn = Math.floor((Date.now() - items[i].time)/1000);
if (secondsBtwn > 31536000){
        timeStamp = Math.floor(secondsBtwn/31536000) + 'y';
    }else if (secondsBtwn >= 604800){
        timeStamp = Math.floor(secondsBtwn/604800) + 'w';
    }else if (secondsBtwn >= 86400){
        timeStamp = Math.floor(secondsBtwn/86400) + 'd';
    }else if (secondsBtwn >= 3600){
        timeStamp = Math.floor(secondsBtwn/3600) + 'h';
    }else if (secondsBtwn >= 60){
        timeStamp = Math.floor(secondsBtwn/60) + 'm';
    }else{
        timeStamp = Math.floor(secondsBtwn) + 's';
    }
items[i].time = timeStamp;
}
  items.reverse();
  this.setState({firebaseItems: items})
  this.setState({refreshing: false})
})
}
pressLike(key,likes,dislikes,group){
    var usersLiked = [];
    var query = firebase.database().ref('posts/'+group+'/posts/'+key+'/usersVoted').orderByKey();
    query.once ('value', (snap) => {
      snap.forEach ( (child) => {       
       usersLiked.push({
         expoID:child.val().expoID
     });
     })
     }).then(() => {
      var addUserID = true;
             for (i = 0; i < usersLiked.length; i++) {
                if (usersLiked[i].expoID == expoID){
             var addUserID = false;
    }
    }
if (addUserID == true){
    firebase.database().ref('posts/'+group+'/posts/'+key+'/votes/'+expoID).update({ voteNum: '0' })
    firebase.database().ref('posts/'+group+'/posts/'+key+'/usersVoted').push().set({ expoID:expoID })
}
}).then(() =>{
firebase.database().ref('posts/'+group+'/posts/'+key+'/votes/'+expoID).once("value", dataSnapshot => {
 voteNum=dataSnapshot.val().voteNum
}).then(() =>{
if (voteNum == 0){
   firebase.database().ref('posts/'+group+'/posts/'+key).update({ likes: likes + 1 });
   firebase.database().ref('posts/'+group+'/posts/'+key+'/votes/'+expoID).update({ voteNum: '2' });
   this.updateVotes(key,'l')
  }
})
  })
}
pressDislike(key,likes,dislikes,group){
       var usersLiked = [];
    var query = firebase.database().ref('posts/'+group+'/posts/'+key+'/usersVoted').orderByKey();
    query.once ('value', (snap) => {
      snap.forEach ( (child) => {       
       usersLiked.push({
         expoID:child.val().expoID
     });
     })
     }).then(() => {
      var addUserID = true;
             for (i = 0; i < usersLiked.length; i++) {
                if (usersLiked[i].expoID == expoID){
             var addUserID = false;
    }
    }
if (addUserID == true){
    firebase.database().ref('posts/'+group+'/posts/'+key+'/votes/'+expoID).update({ voteNum: '0' })
    firebase.database().ref('posts/'+group+'/posts/'+key+'/usersVoted').push().set({ expoID:expoID })
}
}).then(() =>{
firebase.database().ref('posts/'+group+'/posts/'+key+'/votes/'+expoID).once("value", dataSnapshot => {
 voteNum=dataSnapshot.val().voteNum
}).then(() =>{
if (voteNum == 0){
   firebase.database().ref('posts/'+group+'/posts/'+key).update({ dislikes:dislikes + 1 });
   firebase.database().ref('posts/'+group+'/posts/'+key+'/votes/'+expoID).update({ voteNum: '1' });
   this.updateVotes(key,'d');
  }     
})
  })
}
  _onRefresh() {
    this.setState({refreshing: true});
    this.getItems()
  }
updateVotes(key,vote){
var items = this.state.firebaseItems;
   for (i = 0; i < items.length; i++) {
     if (items[i].key == key){
         if (vote == 'd'){
    var passNum = items[i].dislikes+1;
    items[i].dislikes = passNum;
    break;
    }else{
    var passNum = items[i].likes+1;
    items[i].likes = passNum
    break;
    }
     }
   }
    this.setState({firebaseItems: [{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'AMA',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     },{
     content: 'An unexpected error occured. Please refresh your feed and try again. ):',
     key: 'no-key',
     nameID: 50,
     userID: 100,
     commentPreview: ' ',
     comments: 10,
     likes: 10,
     dislikes: 10,
     group: 'Phoenix Errors',
     time: '54s',
     image: ' ',
     imageW: 0,
     imageH: 0
     }]
   })
    this.setState({firebaseItems: items})
}
 render() {
    return (
      <View style={styles.container}>
      
        {this.state.fontLoaded ? (
          <View style={styles.container}>
                    
            <ScrollView   
     refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />
        }
ref='_scrollView'>
      <View style={{paddingLeft: 5, paddingRight:5}}>
    <View style={{width: this.state.postWidth, height: 100, backgroundColor: '#bcbcbc', alignItems:'center',justifyContent:'center', borderBottomRightRadius:7,borderBottomLeftRadius:7}}>
 <Text style={{ fontWeight: 'bold', fontSize: 18,color:'#2c2c2c' }} numberOfLines={1}>
         {this.state.group}
            </Text>  
   </View>
<View style={{height:6,width:1}}/>
     <FlatList
        data = {this.state.firebaseItems}
    renderItem={({ item, index }) =>
     <View>
{item.likes > 4 &&
<View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
<Text style={{
        fontSize: 15,
        color: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))],
          }}>
            Trending
          </Text>
            <Image style={{height:15,width:15,tintColor:darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}} source={require('./CandidtwoImages/trending.png')} />
</View>
}
    <View elevation={2} style={{ shadowOpacity:0.5,shadowRadius:2,width: parseInt(this.state.postWidth), height: 35, backgroundColor: brightColor[Math.floor((item.content.length/10)+(item.nameID * 2))], borderTopLeftRadius: 7, borderTopRightRadius: 7, paddingTop:5,paddingLeft:5,flexDirection:'row',justifyContent: 'space-between',
}}>
<View style={{
    width: 24,
    height: 24,
    borderRadius: 24/2,
    backgroundColor: '#FFFFFFa9',
}}>
                    <Image style={{height:27,width:27,tintColor:darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}} source={icons[Math.floor((item.content.length/10)+(item.nameID * 2))]} />
</View>
                    <Text style={{ fontWeight:'bold',fontSize: 17,color: '#ffffff'}}>
                        { animalNames[Math.floor((item.content.length/10)+(item.nameID * 2))] }
                    </Text>
    <View style={{width: 2, height: 1, backgroundColor: brightColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
    <View style={{width: 2, height: 1, backgroundColor: brightColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
    <View style={{width: 2, height: 1, backgroundColor: brightColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
<View style={{width: this.state.postWidth, height: 20,flexDirection:'row'}}>
<Text style={{
            fontSize: 15,
            color: '#ffffff',
        backgroundColor: '#fe8200',
            textAlign: 'left',
    fontWeight: 'bold',
        borderRadius: 5
          }}>
            {expoID == item.userID ? "YOU" : ""}
          </Text>
    <View style={{width: 8, height: 1, backgroundColor: brightColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
<Text style={{
        fontSize: 15,
        color: '#ffffff',
        backgroundColor: '#fe8200',
        textAlign: 'left',
        borderRadius: 5,
    fontWeight: 'bold'
          }}>
            {Math.floor(item.content.length/30)+1}
          </Text>
    <View style={{width: 8, height: 1, backgroundColor: brightColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
<Text style={{
        fontSize: 15,
        color: brightColor[Math.floor((item.content.length/10)+(item.nameID * 2))],
        backgroundColor: '#ffffff',
        textAlign: 'left',
        borderRadius: 14,
    fontWeight: 'bold'
          }}>
            {' '+item.group+' '}
          </Text>
    <View style={{width: 8, height: 1, backgroundColor: brightColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
</View>
        </View>
<View  elevation={2} style={{height:15,width:this.state.postWidth,paddingRight:5, backgroundColor: brightColor[Math.floor((item.content.length/10)+(item.nameID * 2))],flexDirection:'row'}}>
<View style={{width:6,height:1}}/>
  <Text style={{
        fontSize: 12,
        color: '#f4f4f4',
          }}>
            {item.timeStamp}
          </Text>
</View>
                <TouchableWithoutFeedback onPress={() => { this.props.navigation.navigate('CommentScreen',{postKey: item.key, postContent: item.content, passNameID: item.nameID, userID: item.userID,group:item.group})}}>
        <View elevation={2} style={{width: parseInt(this.state.postWidth), height: this.state.postWidth, backgroundColor: brightColor[Math.floor((item.content.length/10)+(item.nameID * 2))],  alignItems: 'center', justifyContent: 'center', paddingLeft: 12, paddingRight:12,paddingTop:35,paddingBottom:60}}>
            <Text style={{ fontFamily: 'JosefinSans-Regular.ttf', fontSize: 22, color: '#ffffff', textAlign: 'center'}} numberOfLines={7}>
                        { item.content }
                   </Text>
      {item.image.length != 1 &&
    <View style={{ paddingTop:15}}>
    <Image style={{width:iWidth, height: (iWidth*item.imageH)/item.imageW}} source={{uri: 'data:image/png;base64,'+item.image}}/>
    </View>
      }
        </View>
                </TouchableWithoutFeedback>
    
              
<View  elevation={2} style={{width: parseInt(this.state.postWidth), height: 40, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))], flexDirection: 'row',paddingLeft:5,justifyContent:'space-between'}}>
 
 <TouchableHighlight onPress={() => {
         this.pressLike(item.key,item.likes,item.dislikes,item.group);
        }}>
<Image style={{height:39,width:39,tintColor:'white'}} source={require('./CandidtwoImages/unlove.png')} />
                </TouchableHighlight>
            <Text style={{ fontFamily: 'JosefinSans-Regular.ttf',  fontSize: 20, color: '#ffffff',paddingTop:5}}>
                         { item.likes }
                    </Text>
    <View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
    <View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
 <TouchableHighlight onPress={() => {
          this.pressDislike(item.key,item.likes,item.dislikes,item.group);
        }}>
            <Image style={{height:39,width:39,tintColor:'white'}} source={require('./CandidtwoImages/undislike.png')} />
                </TouchableHighlight>
            <Text style={{ fontFamily: 'JosefinSans-Regular.ttf', fontSize: 20, color: '#ffffff',paddingTop:5}}>
                        { item.dislikes }
                    </Text>
     <View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
    <View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
 <TouchableWithoutFeedback onPress={() => { this.props.navigation.navigate('CommentScreen',{postKey: item.key, postContent: item.content, passNameID: item.nameID, userID: item.userID,group:item.group})}}>
    <Image style={{height:39,width:39}} source={require('./CandidtwoImages/comments.png')}/>
</TouchableWithoutFeedback>
     <Text style={{ fontFamily: 'JosefinSans-Regular.ttf',  fontSize: 20, color: '#ffffff',paddingTop:5}}>
                        { item.comments }
                   </Text>
 <View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
    <View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
        <TouchableWithoutFeedback onPress={() => {
    if (item.userID
 == expoID){Alert.alert("Error: you can not send a direct message to yourself.")} else { this.props.navigation.navigate('Chat',{postKey: item.key, userID:item.userID,opl: item.content.length,nameID:item.nameID,group:item.group})  }}}>
        <Image style={{width:34,height:36,tintColor:'white'}}source={require('./CandidtwoImages/mail.png')}/>
    </TouchableWithoutFeedback>
 <View style={{width: 6, height: 1, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
    <View style={{width: 9, height: 1, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
    <TouchableWithoutFeedback onPress={() => { Clipboard.setString(item.content); Alert.alert('Copied text');}}>
        <Image style={{width:34,height:33,tintColor:'white'}}source={require('./CandidtwoImages/copytext.png')}/>
    </TouchableWithoutFeedback>
 <View style={{width: 3, height: 1, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
    </View>
  <View elevation={2} style={{width: parseInt(this.state.postWidth), height: this.state.postWidth, borderBottomLeftRadius: 7, borderBottomRightRadius: 7, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))], paddingLeft:10, paddingRight:10}}>
 <View  elevation={2} style={{width: 1, height: 4, backgroundColor: darkColor[Math.floor((item.content.length/10)+(item.nameID * 2))]}}/>
{item.commentPreview.length != 1 &&
    <TouchableWithoutFeedback onPress={() => { this.props.navigation.navigate('CommentScreen',{postKey: item.key, postContent: item.content, passNameID: item.nameID, userID: item.userID,group:item.group})}}>
    <View style={{paddingBottom:5}}>
  <Text style={{fontSize: 16, fontWeight:'bold', color: '#ffffff', textAlign: 'left'}}>
                        Read all {item.comments} comment{item.comments == 1 ? "" : "s"}
                    </Text>
                  <Text style={{fontSize: 15, color: '#ffffff', textAlign: 'left'}} numberOfLines={1}>
                        { item.commentPreview }
                    </Text>
    </View>
</TouchableWithoutFeedback>
      }
    </View>
                <View style={{width: 1, height: 6, backgroundColor: '#e8e8e8'}} />
            </View>
  }
    />
{this.state.firebaseItems &&
<View>
<TouchableHighlight onPress={() => {
   this.setState({numOfPosts: this.state.numOfPosts + 15})
   this.getItems();
}}>
<View style={{width:this.state.postWidth,height:60,borderRadius:7,backgroundColor:'#fe8200',alignItems:'center',justifyContent:'center'}}>
<Text style={{ fontWeight:'bold',fontSize: 18,color: '#ffffff'}}>
Tap to load more posts
</Text>
</View>
</TouchableHighlight>
                <View style={{width: 1, height: 6, backgroundColor: '#e8e8e8'}} />
</View>
}
</View>
</ScrollView>
      </View>) : (null) }
      </View>
    );
  }
}
class myGroups extends React.Component {
static navigationOptions = {
    header:null,
    tabBarVisible: false,
    tabBarIcon: () => (
      <Image
        source={require('./CandidtwoImages/starTab.png')}
        style={[styles.icon, {tintColor: '#A9A9A9'}]}
      />
    ),
  };
    state = {
      fontLoaded: false,
    };
   _onRefresh() {
    this.setState({refreshing: true});
    this.getItems()
  }
getItems(){
var query2 = firebase.database().ref('users/'+expoID+'/groups').orderByKey();
query2.once('value', (snap) => {
  var myGroups = [];
  snap.forEach((child) => {
    myGroups.push({
      name: child.val().name,
    });
  })
var myGroupsA = [];
var myGroupsB = [];
var getA = true;
 for (i = 0; i < myGroups.length; i++) {
  if (getA){
   myGroupsA.push(myGroups[i].name)
   getA = false;
  } else {
  if (getA == false){
   getA = true
  } }
 }
var getB = true;
 for (i = 1; i < myGroups.length; i++) {
if (getB){
   myGroupsB.push(myGroups[i].name)
   getB = false;
  } else {
  if (getB == false){
   getB = true
  } }
 }
this.setState({firebaseItemsA: myGroupsA});
this.setState({firebaseItemsB: myGroupsB});
this.setState({refreshing:false});
})
}
async componentDidMount() {
    await Font.loadAsync({
      'JosefinSans-Regular.ttf': require('./JosefinSans-Regular.ttf'),
    });
    this.setState({ fontLoaded: true });
    this.getItems();
  }
render() {
  return(
<View style={styles.container}>
   {this.state.fontLoaded ? (
<View style={styles.container}>
<View>
<View style={{width: this.state.postWidth, height: 50, backgroundColor: 'white'}}>
         <View style={{width: this.state.postWidth, height: 50, backgroundColor: '#f9f9f9',alignItems:'center',justifyContent:'space-between',flexDirection:'row'}}>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Notifs')}}>
<View style={{ height:50,width:iWidth/2,backgroundColor:'#f9f9f9',alignItems:'center'}}>
<View style={{width: 2, height: 27}}/>
 <Text style={{ fontSize: 12,color:'#929292' }}>
               Notifications
            </Text>
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('myGroups')}}>
<View style={{ height:50,width:iWidth/2,backgroundColor:'#fe8200',alignItems:'center'}}>
<View style={{width: 2, height: 27}}/>
 <Text style={{ fontSize: 12,color:'white' }}>
              My Groups
            </Text>
</View>  
</TouchableHighlight>
</View>
</View>
  <View style={{width: parseInt(this.state.postWidth), height: 1, backgroundColor: '#e8e8e8'}}>
    <Text style={{fontSize: 22, color: '#e8e8e8', textAlign: 'center'}}>
   ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
    </Text>
      </View>
</View>
<ScrollView refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />}>
<View style={{paddingRight:10,paddingLeft:5}}>
 <View style={{width: parseInt(this.state.postWidth), height: 1, backgroundColor: '#e8e8e8'}}>
    <Text style={{fontSize: 22, color: '#e8e8e8', textAlign: 'center'}}>
   ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
    </Text>
      </View>
<View style={{width:1,height:6}}/>
<View style={{flexDirection:'row',width:iWidth}}>
<View style={{width:5}}/>
<View style={{width:(iWidth/2)-2.5}}>
<FlatList
  data={this.state.firebaseItemsA}
  renderItem={({item}) =>
<View>
 <TouchableWithoutFeedback onPress={() => { this.props.navigation.navigate('groupView',{group: item})}}>
    <View style={{width: (iWidth/2)-10,height: (iWidth/2)-10,backgroundColor:"#ffc26d",borderRadius:10,alignItems:'center',justifyContent:'center'}}>
      <Text style={{ fontWeight:'bold',fontSize: 14, color: '#2d2d2d',paddingBottom:20}}>
{item}
</Text>
</View>
</TouchableWithoutFeedback>
<View style={{height:6}}/>
</View>
}
/>
</View>
<View style={{width:(iWidth/2)-2.5}}>
<FlatList
  data={this.state.firebaseItemsB}
  renderItem={({item}) =>
<View>
 <TouchableWithoutFeedback onPress={() => { this.props.navigation.navigate('groupView',{group:item})}}>
    <View style={{width: (iWidth/2)-10,height: (iWidth/2)-10,backgroundColor:"#ffc26d",borderRadius:10,alignItems:'center',justifyContent:'center'}}>
      <Text style={{ fontWeight:'bold',fontSize: 14,color: '#2d2d2d',paddingBottom:20}}numberOfLines={3}>
{item}
</Text>
</View>
</TouchableWithoutFeedback>
<View style={{height:6}}/>
</View>
}
/>
</View>
</View>
 <View style={{width: 6, height: 1}} />
</View>
</ScrollView>
<View>
         <View style={{width: this.state.postWidth, height: 50, backgroundColor: '#f9f9f9',alignItems:'center',justifyContent:'space-between',flexDirection:'row'}}>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Feed')}}>
<View style={{ height:50,width:50,backgroundColor:'#f9f9f9',alignItems:'center'}}>
        <Image style={{width:25,height:25,tintColor:'#929292'}}source={require('./CandidtwoImages/feedtab.png')}/>
 <Text style={{ fontSize: 12,color:'#929292' }}>
               Feed
            </Text>
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Groups')}}>
<View style={{ height:50,width:50,backgroundColor:'#f9f9f9',alignItems:'center'}}>
        <Image style={{width:25,height:25,tintColor:'#929292'}}source={require('./CandidtwoImages/starTab.png')}/>
 <Text style={{ fontSize: 12,color:'#929292' }}>
               Groups
            </Text>
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Post')}}>
<View elevation={2} style={{shadowOpacity:0.5,shadowRadius:2,borderRadius:50/2, height:50,width:50,backgroundColor:'white',alignItems:'center'}}>
        <Image style={{width:26,height:26,tintColor:'#2d2d2d'}}source={require('./CandidtwoImages/plus.png')}/>
 <Text style={{ fontSize: 15,color:'#2d2d2d',fontWeight:'bold' }}>
                Post
            </Text>
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Chats')}}>
<View style={{ height:50,width:50,backgroundColor:'#f9f9f9',alignItems:'center'}}>
        <Image style={{width:24,height:26,tintColor:'#929292'}}source={require('./CandidtwoImages/mail.png')}/>
 <Text style={{ fontSize: 12,color:'#929292' }}>
               Chats
            </Text>
</View>  
</TouchableHighlight>
<TouchableHighlight onPress={() => {this.props.navigation.navigate('Notifs')}}>
<View style={{ height:50,width:50,backgroundColor:'white',alignItems:'center'}}>
        <Image style={{width:27,height:27,tintColor:'#fe8200'}}source={require('./CandidtwoImages/NotificationIcon.png')}/>
 <Text style={{ fontSize: 14,color:'black' }}>
               You
            </Text>
</View>  
</TouchableHighlight>
</View>
 <View style={{width: parseInt(this.state.postWidth), height: 1, backgroundColor: '#f9f9f9'}}>
    <Text style={{fontSize: 22, color: '#e8e8e8', textAlign: 'center'}}>
   ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
    </Text>
      </View>
</View>
</View>
   ) : (null) }
</View>
  )
 }
}

class settings extends React.Component {
render() {
  return(
          <View style={styles.postcontainer}>
 <ScrollView>
   <View style={{width: 1, height: 6}} />
 <Text style={{ fontWeight: 'bold', fontSize: 18,color:'black' }}>
  App settings/info
            </Text>  
<View style={{width: iWidth, height: 8, backgroundColor: '#ffffff'}}>
    <Text style={{fontSize: 22, color: '#ffffff', textAlign: 'center'}}>
   ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
    </Text>
      </View>
 <View style={{width: 2500, height: 1, backgroundColor: 'grey'}} />
   <View style={{width: 1, height: 6}} />
 <Text style={{ fontWeight: 'bold', fontSize: 16,color:'#fe8200' }}>
  PHOENIX BETA
            </Text>  
<View style={{width: iWidth, height: 8, backgroundColor: '#ffffff'}}>
    <Text style={{fontSize: 22, color: '#ffffff', textAlign: 'center'}}>
   ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
    </Text>
      </View>
 <View style={{width: 2500, height: 1, backgroundColor: 'grey'}} />
   <View style={{width: 1, height: 6}} />
 <Text style={{ fontWeight: 'bold', fontSize: 14,color:'#2d2d2d' }}>
  Credit:
            </Text>  
         <Text style={{ fontSize: 12, color: '#2d2d2d',fontWeight:'bold'}}>
        Heart icon copyright: Benjamin J Sperry, 2017.
                </Text>
 <Text style={{ fontSize: 12, color: '#2d2d2d',fontWeight:'bold'}}>
        Animal Icons: Made by freepic at https://www.flaticon.com/authors/freepik
                </Text>
 <Text style={{ fontSize: 12, color: '#2d2d2d', fontWeight:'bold'}}>
        Gear (settings) Icon: Made by Gregor Cresnar at https://www.flaticon.com/authors/gregor-cresnar
                </Text>


 <View style={{width: 1, height: 6, backgroundColor: 'white'}} />
 <View style={{width: 2500, height: 1, backgroundColor: 'grey'}} />
   <View style={{width: 1, height: 6}} />

 <Text style={{ fontSize: 14, fontWeight:'bold',color:'#2d2d2d'}}>
    Your user ID: {' '}{expoID}
                </Text>
 <Text style={{ fontSize: 12, color: '#2d2d2d',}}>
        You should only ever use your ID if you are getting an error and want to contact the Dev (officalgiise@gmail.com)
                </Text>
 <View style={{width: 1, height: 6, backgroundColor: 'white'}} />
 <View style={{width: 2500, height: 1, backgroundColor: 'grey'}} />
   <View style={{width: 1, height: 6}} />
 <Text style={{ fontSize: 14, fontWeight:'bold', color: '#2d2d2d'}}>
   Leave all groups
                </Text>
 <Text style={{ fontSize: 12, color: '#2d2d2d', textAlign: 'center'}}>
   You should use this button if you are having problems getting the app to load, or if you want to leave all the groups you are in.
                </Text>
<Button
        onPress={() =>{
          firebase.database().ref('users/'+expoID+'/groups').remove();
	  Alert.alert('You are now not in any groups. Go join some and refresh your feed.');
    }}
        title="Leave all groups"
    color="red"
      />
 </ScrollView>
</View>
  )
 }
}

const styles = StyleSheet.create({
  container: {
    flex: 10000,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerw: {
    flex: 10000,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postcontainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingRight:10,
    paddingLeft:10,
    
  },
  button: {
    flex: 1,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
 icon: {
    width: 27,
    height: 27,
  },
});
const Tabs = TabNavigator({
  Feed: {
    screen: FeedView,
  },
  Groups: {
    screen: Groups,
  },
  Chats:{
    screen: Chats,
  },
  Notifs: {
    screen: Notifications,
  },
  myGroups: {
    screen: myGroups,
  },
},
{
  tabBarPosition: 'bottom',
  animationEnabled: false,
  tabBarOptions: {
    activeTintColor: 'whitw',
    inactiveTintColor: 'grey',
    activeBackgroundColor: 'white',
    inactiveBackgroundColor: 'grey',
    showIcon: 'true',
    showLabel: 'false',
  },
tabBarOptions: {
  showIcon: 'true',
  style: {
    backgroundColor: 'white',
  },
  tabStyle: {
    height: 53,    
  },
  labelStyle: {
    fontSize: 14,
    color: 'grey',
  },
  iconStyle: {
    showIcon: 'true',
  },
  indicatorStyle: {
    backgroundColor: '#fe8200',
  },
}
});
const MyApp = StackNavigator({
  Tabs: {
    screen: Tabs,
  },
  CommentScreen: {
    screen: Comments,
  },
 Chat: {
    screen: chat,
  },
  Post: {
    screen: PostScreen,
  },
  createGroup: {
    screen: newGroup,
  },
  groupView: {
    screen: GroupView,
  },
  Settings: {
    screen: settings,
  },
});
export default MyApp;

