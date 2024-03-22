import { Component } from "../core/hello";
import characterStore, { totalCount, getFirstList, getNextList, getSelectedCharacter } from "../store/characters";

export default class CharacterList extends Component {
  constructor() {
    super({tagName: 'section'});

    characterStore.subscribe('characters', () => {  
      this.render();
    }) 
  }

  async render() {
    this.el.classList.add('list');

    // 로딩
    this.el.classList.add('msg-ver');
    this.el.innerHTML = /*html */`
      <div class="loader-box"><div class="the-loader"></div></div>
      <div class="btn--add"><div class="btn--add__plus"></div><div class="btn--add__plus"></div></div>`;


    ///////  1 페이지면 첫번째 리스트 로딩 ////////
    if (characterStore.state.page === 1 && !characterStore.state.searchText) {
      try {
        // 1페이지 리스트 가져오기
        await getFirstList(); 
        // 데이터 총 건수 가져오기
        await totalCount();
      } catch (error) {
        console.log("첫 페이지 로딩 실패 : ", error);
      }

      // 등록된 데이터가 없으면 그대로 종료
      if (characterStore.state.totalCount === 0) {
        // 메시지 처리
        characterStore.state.message = '등록된 캐릭터가 없어요!';
        this.el.innerHTML = /* html */ `
        <div class ='message'>${characterStore.state.message}</div>
        <div class="btn--add"><div class="btn--add__plus"></div><div class="btn--add__plus"></div></div>`;
        this.el.classList.add('msg-ver');
      } else {
        // 추가버튼
        this.el.innerHTML = /* html */ `
        <div class="btn--add"><div class="btn--add__plus"></div><div class="btn--add__plus"></div></div>
        `;
        this.el.classList.remove('msg-ver');
      }
    } 
    // 검색리스트용
    if (characterStore.state.searchText) {
      if(characterStore.state.searchedCount === 0) {
        characterStore.state.message = '검색된 캐릭터가 없어요!';
        this.el.innerHTML = /* html */ `
          <div class ='message'>${characterStore.state.message}</div>
          <div class="btn--add"><div class="btn--add__plus"></div><div class="btn--add__plus"></div></div>`;
          this.el.classList.add('msg-ver');
      } else {
        // 추가버튼
        this.el.innerHTML = /* html */ `
          <div class="btn--add"><div class="btn--add__plus"></div><div class="btn--add__plus"></div></div>`;
        this.el.classList.remove('msg-ver');
      }
    }
    
    // 현재 브라우저에 표시된 캐릭터 총 건수
    let totalViewCount = 0;
    const charFirstList = characterStore.state.characters[0];

    // 페이지별로 배열로 갖고 있으므로 첫번째 리스트의 인덱스는 0
    charFirstList?.forEach(character => { 
      this.el.innerHTML += getHtml(character);
      totalViewCount++;
    });

    // infinite scroll 제어
    const io = new IntersectionObserver( (entries) => {
      entries.forEach(async entry => {    

        //출력할 데이터가 있는지 확인하고 없으면 disconnect 하고 종료
        if(!characterStore.state.searchText) {    
          if (totalViewCount === characterStore.state.totalCount) {
            console.log(
              "총 데이터 수 :", characterStore.state.totalCount, 
              " Page 수 :", characterStore.state.page ,
              " 모든 캐릭터 출력 완료!"); 
            io.disconnect();
            return;
          }
        } else {
          if (totalViewCount === characterStore.state.searchedCount) {
            console.log(
              "총 데이터 수 :", characterStore.state.searchedCount, 
              " Page 수 :", characterStore.state.page ,
              " 모든 캐릭터 출력 완료!"); 
            io.disconnect();
            return;
          }
        }
    
        if (entry.isIntersecting) { 
          // 다음 타겟이 뷰포트에 들어왔으므로 처음 타겟은 unobserve
          io.unobserve(last);

          if (!characterStore.state.searchText) {
            try {
              await getNextList(); 

            } catch (error) {
              console.log("다음페이지 로딩 실패 : ", error);
            }
          } else {
            characterStore.state.page += 1
          }
  
          // 페이지별로 리스트를 배열로 갖고 있으므로 인덱스는 page-1
          const listIndex = characterStore.state.page - 1;
          const charNextList = characterStore.state.characters[listIndex];

          charNextList?.forEach(character => { 
            this.el.innerHTML += getHtml(character);
            totalViewCount++;
          }); 

          const nodes = this.el.querySelectorAll(".card");     
          const newLast = nodes[nodes.length- 1];
          // 마지막 div 요소를 감시한다  
          io.observe(newLast);        
        }
      })
    }, {threshold: 0.7});   

    const nodes = this.el.querySelectorAll(".card");  
    const last = nodes[nodes.length- 1]; 
    if (last) io.observe(last);

    // 이벤트 위임 (버블링)
    this.el.addEventListener('click', async (res) => {
      // 추가 버튼 제어
      const addBtnEl = res.target.getAttribute('class');
      if ( addBtnEl === 'btn--add' || addBtnEl === 'btn--add__plus') {
        document.querySelector('.add').classList.remove('hide');
        document.querySelector('body').classList.add('blur');
      // 캐릭터 카드 클릭 제어
      } else {
        const characterID = res.target.getAttribute('data-character-id');
        if (characterID) {
          document.querySelector('.detail').classList.remove('hide');
          document.querySelector('body').classList.add('blur');
          await getSelectedCharacter(characterID);
        }
      }
    })
  } 
}

function getHtml(character) {
  // 나이 정보가 있으면 뒤에 "세" 를 붙이기
  if (Number(character.age) >= 0) character.age = character.age + " 세";

  const html =  /*html */` 
    <div>
    <div class="card">
      <div class="front"><img src="${character.pic_url}" alt="${character.name}" data-character-id="${character.id}"></div>
      <div class="back" data-character-id="${character.id}">
        <div class="name" data-character-id="${character.id}"> ${character.name} </div> 
        <div class="age" data-character-id="${character.id}">나이 : ${character.age}</div> 
        <div class="nationality"data-character-id="${character.id}">국적 : ${character.nationality} </div> 
        <div class="filmography"data-character-id="${character.id}">필모그래피 : ${character.filmography} </div> 
      </div>
    </div></div>`;

  return html;
}

