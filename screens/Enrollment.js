import React, {Component} from 'react'
import {ScrollView, View, Text, Image, TextInput, TouchableOpacity, KeyboardAvoidingView} from 'react-native'
import { bindActionCreators } from 'redux';
import Header from '../components/Header'
import {connect} from 'react-redux' 
import {Child, Guardian, EmergencyContact, Rate} from '../components/Forms'
import ErrorMessage from '../components/ErrorMessage'
import {styles} from '../components/Forms/styles'
import {addAccount} from '../actions/accounts'
import {makePayment} from '../actions/payments'
import uuid from 'uuid'

class Enrollment extends Component{
  constructor(props){
    super(props)
    this.state ={
      children: {
        img_uri: null,
        f_name: null,
        l_name: null,
        birthdate:0,
        gender: null,
        notes:null,
        id: uuid()
      },
      guardians: {
        f_name: null,
        l_name: null,
        street: null,
        city: null,
        phone: null,
        govt_id: null,
        id: uuid()
      },
      e_contacts: {
        f_name: null,
        l_name: null,
        phone: null,
        id: uuid()
      },
      rate: 0,
      frequency: 'daily',
      balance: 0,
      message: null,
    } 
  }
  
   static navigationOptions = {
    headerLeft: null,
    headerStyle: {
      backgroundColor: '#ff7e09',
      height:0
    }
  }

  addURI = (uri) => {
    this.setState({
      children: {
        ...this.state.children,
        img_uri: uri
      }
    })
  }

  handleChangeText = (text, type, entry) => {
    this.setState({
      [type]:{
        ...this.state[type],
        [entry]: text
      }
    })
  }

  handlePress = (gender) => {
    this.setState({
      children:{
        ...this.state.children,
        gender
      }})
  }

  handleFrequency = (upOrDown) => {
    let frequency = this.state.frequency
    if (upOrDown === 'up'){
      if (frequency === 'daily') this.setState({ frequency: 'weekly' })
      if (frequency === 'weekly') this.setState({ frequency: 'termly' })
      if(frequency === 'termly') this.setState({frequency:'daily'})
    }
    else {
      if (frequency === 'daily') this.setState({ frequency: 'termly' })
      if (frequency === 'termly') this.setState({ frequency: 'weekly' })
      if (frequency === 'weekly') this.setState({ frequency: 'daily' }) 
    }
  }

  handleSubmit = async () => {
    const message = []
    const children = this.state.children
    const guardians = this.state.guardians
    // if(!children.f_name || !children.l_name || !guardians.f_name || !guardians.l_name) message.push('Guardians and children need first and last names')
    // if(!guardians.phone) message.push('You need to add a phone number for guarians')
    // if(!this.state.rate) message.push('You need to include a rate')
    if(message.length){
      this.setState({
        message: message.join('<br>')
      })
      return
    }
    const id = uuid()
    const account = {
      children: [this.state.children],
      guardians: [this.state.guardians],
      e_contacts: [this.state.e_contacts],
      rate: this.state.rate,
      frequency: this.state.frequency,
      id,
      balance: 0
    }

    //NOTE: for some reason the below doesn't work. it navigates, but the fee is not added
    await this.props.addAccount(account)
    
    if(this.state.frequency !== 'daily'){
      
      await this.props.makePayment(id, -Number(this.state.rate), 0) //negative payment will process as fee
      
    }
    
    await this.props.navigation.navigate('Account', {id})
  }
  
  handleRate = (text) => {
    const charCode = text[text.length - 1].charCodeAt(0)
    if (charCode < 48 || charCode > 57) text = text.slice(0, (text.length - 1))
    this.setState({
      rate: text
    })
  }

  addMessage = (message) => {
    this.setState({message})
  }
  
  render(){
   return (
     <KeyboardAvoidingView style={{flex:1}} keyboardVerticalOffset={-500} behavior="padding" enabled>
      <Header navigation={this.props.navigation}/>
      <ScrollView style={{flex:1}}>
        <Child 
          navigation={this.props.navigation} 
          img_uri={this.state.children.img_uri}
          handleChangeText={this.handleChangeText}
          handlePress={this.handlePress}
          addURI={this.addURI}
          addMessage={this.addMessage}
        />
        
        <View style={{height:2, backgroundColor:'#ccc', marginHorizontal:20, marginVertical: 40}}></View>

        <Guardian 
          handleChangeText={this.handleChangeText}
        />

        <View style={{ height: 2, backgroundColor: '#ccc', marginHorizontal: 20, marginVertical: 40 }}></View>

        <EmergencyContact
          handleChangeText={this.handleChangeText}
        />


        <View style={{ height: 2, backgroundColor: '#ccc', marginHorizontal: 20, marginVertical: 40 }}></View>
        
        <Rate handleRate={this.handleRate} handleFrequency={this.handleFrequency} frequency={this.state.frequency}/>

        {this.state.message
          ?  <ErrorMessage error={this.state.message}/>
          : null
        }
        <TouchableOpacity style={styles.submit} onPress={this.handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>

      </ScrollView>
     </KeyboardAvoidingView>
   )
  }
}

const mapStateToProps = state => ({accounts: state.accounts})
const mapDispatchToProps = dispatch => bindActionCreators({addAccount, makePayment}, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(Enrollment)