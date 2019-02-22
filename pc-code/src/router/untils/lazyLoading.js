function loading(name){//加载组件
    return require(`@/components/pages/${name}.vue`).default
}
export default (name)=>{
    return loading(name)
}