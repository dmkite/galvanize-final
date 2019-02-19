import React, { Component } from 'react'
import { Text, View, ScrollView, TouchableOpacity } from 'react-native'
import Header from '../components/Header'
import FilterBlock from '../components/FilterBlock'
import {connect} from 'react-redux'
import {Icon} from 'react-native-elements'
import AccountCard from '../components/AccountCard'
import {styles} from '../components/FilterBlock/styles'
import {getAccounts} from '../actions/accounts'
import { bindActionCreators } from 'redux';
import {LinearGradient} from 'expo'

class Accounts extends Component{
  constructor(props){
    super(props)
    this.state = {
      filter:null,
      filterOpen: false,
      searchTerm: ''
    }
  }
  

  static navigationOptions = {
    headerLeft: null,
    headerStyle: {
      backgroundColor: '#0C000E',
      height: 0
    }
  }

  handlePress = (filter) =>{
    this.setState({filter})
  }

  sortBy = (a, b) => {
    if(this.state.filter === 'balance'){
      return b.balance - a.balance
    }
    if(this.state.filter === 'alphabetical'){
      return b.children[0].l_name - a.children[0].l_name
    }
    
  }
  
  filterBy = (account) => {
    if(this.state.searchTerm.length > 0){
      const childVals = account.children.reduce((acc, child) => {

        delete child.birthdate 
        delete child.notes
        delete child.gender
        delete child.img_uri
        acc = acc.concat(Object.values(child))
        return acc
      }, [])
      const guardianVals = account.guardians.reduce((acc, guardian) => {
        delete guardian.phone
        delete guardian.city
        delete guardian.street
        delete guardian.govt_id
        acc = acc.concat(Object.values(guardian))
        return acc
      }, [])
      for(let val of guardianVals.concat(childVals)){
        if(val.toLowerCase().includes(this.state.searchTerm.toLowerCase())) return true
      }
      return false
    }
    return true
  }

  handleFilterOpen = () => {
    this.setState({
      filterOpen: !this.state.filterOpen})
  }

  handleChangeText = (text) => {
    this.setState({
      searchTerm: text
    })
  }
  
  componentDidMount = () => {
    this.props.getAccounts()
  }

  render(){
    return(
      <LinearGradient
        style={{ flex: 1 }}
        colors={['#11011B', '#3C233D']}>
        <Header navigation={this.props.navigation} />
        {this.state.filterOpen ? <FilterBlock filter={this.state.filter} handlePress={this.handlePress} handleChangeText={this.handleChangeText}/> :  null}
        <TouchableOpacity style={styles.filterBtn} onPress={this.handleFilterOpen}>
          <Icon name="search" size={30} color="white"/>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.filterBtn, styles.addBtn]} onPress={() => this.props.navigation.navigate('Enrollment')}>
          <Icon name="add" size={30} color="white" />
        </TouchableOpacity>

        <ScrollView style={{flex:1}}>
          <Text style={styles.h1}>Accounts</Text>
          {this.props.accounts.accounts.length === 0 
            ? <View>
                <Text style={{fontSize:18, margin:10}}>You have not added any accounts yet.</Text>
                <TouchableOpacity style={{ flexDirection: 'row', margin: 10 }} onPress={() => this.props.navigation.navigate('Enrollment')}>
                  <Icon style={{flex:.1}} name='add-circle-outline' size={18} />
                  <Text style={{flex: .9, fontSize:18}}> Add an account</Text>
                </TouchableOpacity>
              </View>
            : this.props.accounts.accounts
              .sort(this.sortBy)
              .filter(this.filterBy)
              .map((account, i) => {
                  return <AccountCard key={i} {...account} navigate={this.props.navigation.navigate}/>
                })
          }
        </ScrollView>
      </LinearGradient>
    )
  }
}

mapStateToProps = state => ({accounts: state.accounts})
mapDispatchToProps = dispatch => bindActionCreators({getAccounts}, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(Accounts)