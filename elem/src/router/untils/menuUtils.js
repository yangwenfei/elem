import lazyLoading from './lazyLoading'
let routes=[]
function menuUtils(menuData){
    menuData.forEach(element => {
        if(element.children&&element.children.length>0){
            menuUtils(element.children)
        }else{
           // element.component=lazyLoading(element.path)
            routes.push({
                path:element.path,
                name:element.code,
                component:lazyLoading(element.path)
            })
        }
    });
}
export default (menuData)=>{
    menuUtils(menuData)
    return routes
}