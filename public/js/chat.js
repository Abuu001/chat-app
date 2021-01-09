const socket = io()
const addButton= document.querySelector('#increment')
const messageForm= document.querySelector('#messageForm')
const sendLocation = document.querySelector('#sendLocation')
const inputField =document.querySelector('#messageInput')
const output = document.querySelector("#messages")
const messageTemplate=document.querySelector('#message-template').innerHTML
const sideBarTemplate =document.querySelector('#sidebar-template').innerHTML
const  {username,room}=Qs.parse(location.search,{ignoreQueryPrefix :true})

messageForm.addEventListener('submit',(e)=>{
    const message= inputField.value;
    e.preventDefault()
    console.log(document.location.search);
    addButton.setAttribute('disabled' ,'disabled')
    socket.emit('sendMessage',message,()=>{
        addButton.removeAttribute('disabled')
        console.log("The message was received");
        inputField.value=""
        inputField.focus()
        
    })
  
    socket.on('inputData',(msg)=>{
        console.log(msg);
        const html=Mustache.render(messageTemplate,{
            username : msg.username,
            msg : msg.text ,
            createdAt : moment(msg.createdAt).format('h:mm  a')
        })
        
       output.insertAdjacentHTML('beforeend',html)
    })

})

sendLocation.addEventListener('click',(e)=>{
    e.preventDefault()
    if(!navigator.geolocation){
        return alert('Location not supported by ur browser');
    }
    
    navigator.geolocation.getCurrentPosition((position)=>{
        const latitude  = position.coords.latitude;
        const longitude = position.coords.longitude;
    
        socket.emit('Location',latitude)
        // socket.on("gotLocation",(loc_latitude)=>{
        //     console.log(loc_latitude);
        // })
 
        socket.emit('Location-longitude',longitude)
        socket.on('Location-longitude',(loc_longitude)=>{
            const html=Mustache.render(messageTemplate,{
                loc_longitude 
            })
            console.log(loc_longitude);
            output.insertAdjacentHTML('beforeend',html)
        })
    })

})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sideBarTemplate,{
        room ,
        users
    })

    document.querySelector('#sidebar').innerHTML=html
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href="/"
    }
})

// socket.on('countUpdated',(count)=>{
    //     console.log('The count has been updated ',count);
    // })
    
// addButton.addEventListener('click',(e)=>{
//         e.preventDefault();
//         console.log("clicked");
//         // socket.emit('increment')
        
//         //    socket.on('message',(message)=>{
//             //     console.log(message);
//             //    })
// })