import { Component } from "../core/hello";
import characterStore, { getSearchedList } from "../store/characters"


export default class Header extends Component {
  constructor() {
    super({tagName: "header"});
  }
  render() {
    this.el.innerHTML = /* html */`
    <div class="text-box">
    <h1><a href="/">Disney Characters</a></h1> 
    <span>Who is your favorite character? <br />
    To check the character, please pick one!</span>
    </div>
    <div class="search">
    <input placeholder="이름으로 캐릭터를 검색해보세요!"> 
    <button class ="btn btn--search">Search</button>
    </div>
    `;
  
    const inputEl = this.el.querySelector('input');
    inputEl.addEventListener('input', () => {
      //검색어 받아오기
      characterStore.state.searchText = inputEl.value;
    })

    // 엔터키 눌렀을때   
    inputEl.addEventListener('keypress', async event => {
      if (event.key === "Enter" && characterStore.state.searchText.trim()) {
        try {
          await getSearchedList();
        } catch (error) {
          console.log("검색 에러 : ", error);
        }        
      }
    });
    // 검색버튼 눌렀을때
    const searchBtnEl = this.el.querySelector('.btn--search');
    searchBtnEl.addEventListener('click',  async () => {
      if (characterStore.state.searchText.trim()) {
        try {
          await getSearchedList();
        } catch (error) {
          console.log("검색 에러 : ", error);
        }   
      }
    })
  }
} 