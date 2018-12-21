
function menuFilter(menuData,orgType){//根据组织层级过滤菜单
    for(let i=0;i<menuData.length;i++){
        let item=menuData[i]
        if(item.children&&item.children.length>0){
            menuFilter(item.children,orgType)
        }else{
            if(item.deployLevel.indexOf(orgType)==-1){  
               menuData.splice(i,1) // 将使后面的元素依次前移，数组长度减1
                i--// 如果不减，将漏掉一个元素
            }
        }
    }
    return menuData
}
export default (menuData,orgType)=>{
   let result=  menuFilter(menuData,orgType)
    return result
}