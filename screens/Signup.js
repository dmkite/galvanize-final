import React, {Component} from 'react'
import {View, Text, TouchableOpacity} from 'react-native'
import {Icon} from 'react-native-elements'
import {Caregiver, Centre, Confirm} from '../components/Signup'
import {LinearGradient, SecureStore, Audio} from 'expo'
import uuid from 'uuid'
import {signUp} from '../utilities/authentication'
import bcrypt from 'react-native-bcrypt'
import {styles} from '../components/Signup/styles'
import getAsync from '../utilities/getAsync'
import numberValidation from '../utilities/numberValidation'
import Loading from '../components/Loading'

class Signup extends Component{
  constructor(props){
    super(props)
    this.state = {
      username: null,
      password: '',
      hiddenPassword: '',
      f_name: null,
      l_name: null,
      phone: '',
      centre_address_1:null,
      centre_address_2: null,
      questionFocus: 'caregiver',
      avoidView: false,
      error:false,
      loading:false,
      showHelp: false,
      playing: false,
      loading:false,
      soundObject: null
    }
  }

  static navigationOptions = {
    headerLeft: null,
    headerStyle: {
      backgroundColor: '#0C000E',
      height: 0
    }
  }

  changeQuestions = focusType => this.setState({questionFocus: focusType})
  
  handlePassword = (text) => {
    let password = this.state.password
  
    text.length > this.state.password.length ? password += text[text.length - 1] : password = password.slice(0, password.length - 1)
    let hiddenPassword = ''
    for (let letter of password) {
      hiddenPassword += '*'
    }
    this.setState({
      password : password.trim(),
      hiddenPassword: hiddenPassword.trim()
    })
  }

  handleChangeText = (text, val) => this.setState({[val]: text})
  
  addMargin = num => this.setState({avoidView: num})

  getCode = () => {
    const {username, password, phone} = this.state
    signUp(username.toLowerCase().trim(), password, phone, this.setError, this.changeQuestions)
    this.setState({questionFocus: 'confirm'})
  }

  setError = (err) => {
    setTimeout(
      () => this.setState({ error: false }),
      5000
    )
    this.setState({ error: err })
  }

  storeAndNavigate = async () => {
    let { username, password, f_name, l_name, centre_address_1, centre_address_2 } = this.state
    username = username.toLowerCase()
    const caregiverId = uuid()
    const centreId = uuid()

    const centre = {
      id: centreId,
      centre_address_1,
      centre_address_2
    }
    
    try{
      const { newCaregivers, newCentres} = await getAsync(false, false, false, false, true, true)
      let centreFound = false
      newCentres.map(c => {
        if (c.centre_address_1 === centre.centre_address_1) centreFound = true
        return 
      })
      if(!centreFound) newCentres.push(centre)
      if(newCaregivers[username]) return Promise.all([this.setError(`Username ${username} is already taken`), this.setState({loading:false})])
      else {
        let hashedPW
        return bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            if(err) return Promise.all([this.setError('Something went wrong when making your account'), this.setState({loading:false})])
            hashedPW = hash
            newCaregivers[username] = {
              password: hashedPW, 
              username: username.trim(),
              f_name: f_name.trim(),
              l_name: l_name.trim(),
              id: caregiverId,
              centre_id: centreId
            }
            return Promise.all([
              SecureStore.setItemAsync('_CAREGIVERS', JSON.stringify(newCaregivers)),
              SecureStore.setItemAsync('_CENTRES', JSON.stringify(newCentres)),
              this.setState({loading:false}),
              this.props.navigation.navigate('Home')
            ])
          })
        })
      }
    }catch(err){
      console.error(err)
      this.setState({error:'Something went wrong when making your account'})
    }
  }

  handleNumberChange = (text, field, num1, num2) => {
    let length = 0
    if (this.state[field] && this.state[field].length) length = this.state[field].length
    this.setState({
      [field]: numberValidation(text, field, length, num1, num2)
    })
  }

    playAudio = async () => {
    try{
      if(!this.state.soundObject){
        const soundObject = new Audio.Sound()
        await soundObject.loadAsync(require('../assets/audio/signup.mp3'))
        await soundObject.playAsync()
        this.setState({ soundObject })
      }
      else{   
        await this.state.soundObject.stopAsync()
        this.setState({soundObject: null})
      }
    }catch(err){
      console.error(err)
      this.setState({error:'We could not play the audio file'})
    }
  }  

  componentDidMount = async () => setTimeout(() => this.setState({ showHelp: !this.state.showHelp }), 15000)
   
  render(){
    return (
      <LinearGradient
        style={[{flex:1}, this.state.avoidView ? {marginTop:Number(this.state.avoidView)} : null]}
        colors={['#11011B', '#3C233D']}>
        {this.state.questionFocus === 'caregiver'
          ? <Caregiver 
              handlePassword={this.handlePassword} 
              handleChangeText={this.handleChangeText} 
              addMargin={this.addMargin} 
              {...this.state} 
              changeQuestions={this.changeQuestions}
              handleChangeText={this.handleChangeText}  
              handleNumberChange={this.handleNumberChange}
              setError={this.setError}
            />
          : this.state.questionFocus === 'centre' 
            ? <Centre 
                handleChangeText={this.handleChangeText} 
                addMargin={this.addMargin} 
                {...this.state} 
                changeQuestions={this.changeQuestions} 
                getCode={this.getCode}
                setError={this.setError}
              />
            :<Confirm 
                username={this.state.username.trim().toLowerCase()}
                handleChangeText={this.handleChangeText}
                navigation={this.props.navigation}
                setError={this.setError}
                storeAndNavigate={this.storeAndNavigate}
              />
        }
        { !!this.state.error
          ? <View style={styles.error}>
              <Text style={styles.errorText}>{this.state.error}</Text>          
            </View>
          : null
          }
          {this.state.loading
            ? <Loading/>
            : null
          }
          {this.state.showHelp 
          ? <TouchableOpacity style={{ backgroundColor: '#ffffff80', position: 'absolute', bottom: -75, left: -75, width: 150, height: 150, borderRadius: 75 }} onPress={this.playAudio}>
            <View style={{ position: 'absolute', bottom: 85, left: 80 }}>
              <Icon name="record-voice-over" color="#3C233D" size={36} />
            </View>
          </TouchableOpacity>
          : null
        }
      </LinearGradient>
    )
  }
}

export default Signup