import 'babel-polyfill';
import React, { Component } from 'react';
import Form, {Item, FormItem} from 'noform';
import { Input, Select, Radio } from 'noform/lib/wrapper/antd';
import './App.less';
function Reqeust(url){
  if(/code=1_2$/.test(url)){
    return Promise.resolve([{
      type: 'Input',
      name: 'f12',
      label: '男-山东'
    }])
  }
  if(/code=1_1$/.test(url)){
    return Promise.resolve([{
      type: 'Input',
      name: 'f11',
      label: '男-广东'
    }])
  }
  if(/order-user$/.test(url)){
    return Promise.resolve([{
      type: 'Input',
      name: 'lastName',
      label: '姓'
    }, {
      type: 'Input',
      name: 'firstName',
      label: '名'
    }])
  }
  if(/=order$/.test(url)){
    return Promise.resolve([{
      type: 'NestedForm',
      name: 'user',
      label: '用户信息',
      others: {
        code: 'order-user'
      }
    },{
      type: 'Radio',
      name: 'gender',
      label: '性别',
      others: {
        dataSource:[{
          label: '男',
          value: 1
        }, {
          label: '女',
          value: 2
        }]
      }
    },{
      type: 'Select',
      name: 'location',
      label: '籍贯',
      others: {
        dataSource:[{
          label: '广东',
          value: 1
        }, {
          label: '山东',
          value: 2
        }, {
          label: '河东',
          value: 3
        }]
      }
    },{
      type:'MagicField',
      others: {
        params: ['gender', 'location']
      }
    }]);
  }
  return Promise.resolve([]);
}
class Factory extends Component{
  static getType = (type) => {
    return Factory[type] || null;
  };
  static regist = (type, Com) => {
    if(Factory.getType(type)){
      throw Error(type + 'is exists');
    }
    Com.displayName = 'Factory(' + type + ')';
    return Factory[type] = Com;
  };
  render(){
    return this.props.config.map(({type, name, label, others}, idx) => {
      const Com = Factory.getType(type);
      return <Com key={idx} type={type} name={name} label={label} {...others} />
    })
  }
}

Factory.regist('Input', ({name, label, ...others}) => {
  return <FormItem name={name} label={label}><Input {...others}></Input></FormItem>
})
Factory.regist('Select', ({name, label, ...others}) => {
  return <FormItem name={name} label={label}><Select style={{ width: 120 }} options={others.dataSource} {...others}></Select></FormItem>
})
Factory.regist('Radio', ({name, label, ...others}) => {
  return <FormItem name={name} label={label}><Radio.Group options={others.dataSource} {...others}></Radio.Group></FormItem>
})
Factory.regist('MagicField', ({name, label, ...others}) => {
  const {params} = others;
  return <Item render={(value, form) => {
    const code = params.map(key => value[key] || '').join('_');
    return <MagicField code={code} others={others}></MagicField>
  }}></Item>
})

Factory.regist('NestedForm', ({name, label, ...others}) => {
  const code = others.code;
  return <FormItem name={name} label={label}>
    <Form {...others}>
      <MagicField code={code}></MagicField>
    </Form>
  </FormItem>
})

class MagicField extends Component{
  componentDidMount(){
    this.do(this.props)
  }
  componentWillReceiveProps(nextProps){
    this.do(nextProps);
  }
  async do(props){
    const config = await Reqeust('getconfig.json?code=' + props.code);
    this.setState({ config });
  }
  render(){
    if(!this.state || !this.state.config){
      return null;
    }else{
      return <Factory config={this.state.config}></Factory>
    }
  }
}

export default class App extends Component{
  render(){
    return <Form onMount={core => this.core = window.core = core}>
      <MagicField code="order"></MagicField>
    </Form>
  }
}
