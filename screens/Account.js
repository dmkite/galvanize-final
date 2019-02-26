import React, {Component} from 'react'
import {ScrollView, View, Text, TouchableOpacity} from 'react-native'
import {LinearGradient} from 'expo'
import {Icon} from 'react-native-elements'
import {Child, Guardian, EmergencyContact} from '../components/Forms'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {ChildDetails, GuardianDetails, EmergencyContactDetails, RateDetails} from '../components/AccountDetails'
import Header from '../components/Header'
import {getAccounts, addMemberToAccount, changeField, deleteAccount} from '../actions/accounts'
import {styles} from '../components/AccountDetails/styles'
import uuid from 'uuid'

class Account extends Component {
  constructor(props){
    super(props)
    this.state = {
      editBalance: false,
      newBalance:0,
      newFrequency: 'daily',
      newRate: 0,
      deleteMessage: false,
      avoidView:0,
      currentForm: null, 
      currentlyExpanded: null,
      account: {
        children: [],
        guardians: [],
        e_contacts: [],
        rate: 0,
        frequency: 'daily',
        balance: 0
      },
    }
  }

  static navigationOptions = {
    headerLeft: null,
    headerStyle: {
      backgroundColor: '#0C000E',
      height:0
    }
  }
  
  openForm = (type) => { 
    if(this.state.currentForm === type) this.setState({currentForm: null})
    else this.setState({currentForm: type})
  }

  openDetails = (type) => {
    if(this.state.currentlyExpanded === type) this.setState({currentlyExpanded: null})
    else this.setState({currentlyExpanded: type})
  }
  
  handleChangeText = (text, type, field) => {
    this.setState({
      [type]: {
        ...this.state[type],
        [field]: text
      }
    })
  }

  updateAccount = account => this.setState({account})
  
  changeField = (fieldname, newValue, fieldname2, newValue2) => {
    if (fieldname2 !== undefined && newValue2 !== undefined) this.props.changeField(fieldname, newValue, this.props.navigation.getParam('id'), fieldname2, newValue2)
    else this.props.changeField(fieldname, newValue, this.props.navigation.getParam('id'))
    this.setState({
      editBalance:false,
      account: {
        ...this.state.account,
        [fieldname]: newValue,
        [fieldname2]: newValue2
      }
    })
  }

  addMember = (type, formData) => {
    formData.id = uuid()
    const payload = {
      id: this.props.navigation.getParam('id'),
      content: formData,
      type
    }
    
    this.props.addMemberToAccount(payload)
    this.setState({currentForm:null})
  }
  
  deleteAccount = () => {
    const id = this.props.navigation.getParam('id')
    this.props.deleteAccount(id)
    this.props.navigation.navigate('Accounts')
  }


  addMargin = (num) => this.setState({ avoidView: num })
  
  filterAndReturnType = type => {
   const [account] = this.props.accounts.filter(acct => {
     return acct.id === this.props.navigation.getParam('id')
    })
    if(account && account[type]) return account[type]
    return []
  }
  
  componentDidMount = async () => {
    this.setState({fontLoaded:true})
    return this.props.getAccounts().then(() => {   
      const id = this.props.navigation.getParam('id')
      const [account] = this.props.accounts.filter(acct => acct.id === id)
      this.setState({ account})
    })
  }
  render(){
    return (
      <LinearGradient
        style={[{ flex: 1 }, this.state.avoidView ? { marginTop: Number(this.state.avoidView) } : null]}
        colors={['#11011B', '#3C233D']}>
        <Header navigation={this.props.navigation}/>
        {this.state.deleteMessage
          ? <View style={styles.deleteWarning}>
            <Text>Hold the button down to delete</Text>
            <View style={styles.iconHolder}>
              <Icon name="touch-app" />
              <Icon name="timer" />
              <Icon name="timer-3" />
            </View>
          </View>
          : null
        }
        <ScrollView>
          <Text style={[styles.h1, this.state.fontLoaded ? styles.raleway : null]}>
            {this.state.account.children[0]
              ? `${this.state.account.children[0].l_name || ''} Family`
              : 'Account'
            }
          </Text>
          <RateDetails 
            currentlyExpanded={this.state.currentlyExpanded}
            changeBalance={this.changeBalance}
            balance={this.state.account.balance} 
            changeField={this.changeField}
            openDetails={this.openDetails}
            openForm={this.openForm}
            currentForm={this.state.currentForm}
            rate={this.state.account.rate} 
            frequency={this.state.account.frequency} 
            acctId={this.props.navigation.getParam('id')}
            navigation={this.props.navigation}
          />
          <View style={{height:2, backgroundColor:'#ffffff80', marginVertical:20}}></View>
          <ChildDetails 
            openDetails={this.openDetails}
            currentlyExpanded={this.state.currentlyExpanded}
            navigation={this.props.navigation}
            openForm={this.openForm}
            children={this.filterAndReturnType('children')} 
            acctId={this.props.navigation.getParam('id')}
            updateAccount={this.updateAccount}
          />

          {this.state.currentForm === 'children'
            ? <Child 
                accountAlreadyCreated={true}
                addMargin={this.addMargin}
                openForm={this.openForm}
                navigation={this.props.navigation}
                addMember={this.addMember}
              />
            : null
            }

          <View style={{ height: 2, backgroundColor: '#ffffff80', marginVertical: 20 }}></View>
          <GuardianDetails 
            openDetails={this.openDetails}
            currentlyExpanded={this.state.currentlyExpanded}
            guardians={this.filterAndReturnType('guardians')} 
            navigation={this.props.navigation}
            acctId={this.props.navigation.getParam('id')}
            openForm={this.openForm}
          />

          {this.state.currentForm === 'guardians'
            ? <Guardian 
                accountAlreadyCreated={true}
                addMember={this.addMember}
                addMargin={this.addMargin}
                openForm={this.openForm}
                />
            : null
          }
          <View style={{ height: 2, backgroundColor: '#ffffff80', marginVertical: 20 }}></View>
          <EmergencyContactDetails 
            openDetails={this.openDetails}
            currentlyExpanded={this.state.currentlyExpanded}
            openForm={this.openForm}
            e_contacts={this.filterAndReturnType('e_contacts')} 
            acctId={this.props.navigation.getParam('id')}
            navigation={this.props.navigation}
          />
          {this.state.currentForm === 'e_contacts'
            ? <EmergencyContact 
                handleChangeText={this.handleChangeText} 
                handlePress={this.handlePress} 
                accountAlreadyCreated={true}
                openForm={this.openForm}
                addMargin={this.addMargin}
                addMember={this.addMember}
              />
            : null
          }
          <View style={{ height: 2, backgroundColor: '#ffffff80', marginVertical: 20 }}></View>
          <TouchableOpacity 
            style={styles.button } 
            onPress={() => {
              this.setState({deleteMessage: !this.state.deleteMessage})
              setTimeout(() => {
                this.setState({ deleteMessage: !this.state.deleteMessage })
              }, 5000)}}
            onLongPress={this.deleteAccount}
          >
            <View style={{flexDirection:'row'}}>
              <Icon name="delete" color="#ffffff80" style={{marginRight:5}}/>
              <Text style={[styles.btnText, {marginLeft:5}]}>Delete</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    )
  }
}

const mapStateToProps = state => ({accounts: state.accounts})
const mapDispatchToProps = dispatch => bindActionCreators({getAccounts, addMemberToAccount, changeField, deleteAccount}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Account)