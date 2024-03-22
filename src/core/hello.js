

//// Component //////
export class Component {
  constructor(payload = {}) {
    const { 
      tagName = 'div', 
      state = {}, 
      props = {} 
    } = payload; // 디폴트값을 설정
    this.el = document.createElement(tagName); 
    this.state = state;
    this.props = props;
    this.render();
  }
  render() {
  }
}


/////// Store ///////
export class Store {
  constructor(state) {
    this.state = {};
    this.observers = {};
    // 객체 반복
    for (const key in state) {
      Object.defineProperty(this.state, key, {
        get: () => state[key],
        set: (val) => {
          state[key] = val;  
          if (Array.isArray(this.observers[key])) {         
            this.observers[key].forEach(observer => observer(val));
          }
        }
      }) 
    }
  }
  subscribe(key, cb) {  
    Array.isArray(this.observers[key]) 
      ? this.observers[key].push(cb)
      : this.observers[key] = [cb];
      
  }
}

//// 미리보기 ////
export function readURL(input, targetID) {
    if (input.files && input.files[0]) {
      let reader = new FileReader();
      reader.onload = function(e) {
        document.getElementById(targetID).src = e.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    } else {
      document.getElementById(targetID).src = "";
    }
}
