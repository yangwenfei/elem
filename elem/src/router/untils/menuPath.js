function menuPath(menuData,str,parentIndex){//给菜单设置路由
    menuData.forEach((element,index) => {
        if(element.children&&element.children.length>0){
            //判断父子节点类别
            element._parent=true
            //设置路径
            element.path=element.path? element.path:''
            element.path=str?(str+'/'+element.code):element.code //路由最前面不能加斜杠
            //设置索引
            element.index=parentIndex?(parentIndex+'-'+(index+1)):String((index+1))
            menuPath(element.children, element.path,element.index)
        }else{
            element._parent=false
            element.path=str?(str+'/'+element.code):element.code
            element.index=parentIndex?(parentIndex+'-'+(index+1)):String((index+1))
        }
    });
    return menuData
}
export default (menuData)=>{
    let result=menuPath(menuData,'','')
    return result
}