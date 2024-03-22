import { Component, readURL } from "../core/hello";
import characterStore, { editData }from "../store/characters";

export default class EditCharacter extends Component {

  constructor() {
    super({tagName: 'section'});
    characterStore.subscribe('selectedCharacter', () => {
      this.render();
    }) 
  }
  render() {

    if (characterStore.state.selectedCharacter.length === 0) {
      // 에러메세지
      console.log('캐릭터 안 골랐는데 어떻게 여기로 왔어요?');
    }
      this.el.classList.add('edit', 'hide');

      this.el.innerHTML = /* html */`
      <span class="material-symbols-outlined">close</span>
      <span class="text-box">캐릭터를 편집해보세요</span>
      <div>
        <div class="field-name">이름</div>
        <input class="name"  value="${characterStore.state.selectedCharacter.name}"/>
      </div>
      <div>
        <div class="field-name">나이</div>
        <input class="age"  value ="${characterStore.state.selectedCharacter.age}"/>
      </div>
      <div>
        <div class="field-name">국적</div>
        <input class="nationality"  value ="${characterStore.state.selectedCharacter.nationality}"/>
      </div>
      <div>
        <div class="field-name">필모그래피</div>
        <input class="filmography"  value ="${characterStore.state.selectedCharacter.filmography}"/>
      </div>
      <div>   
        <div class="field-name">프로필사진</div>
        <input type="file" class="img-file" accept=".png, .jpeg, .jpg, .webp"/>
      </div>
      <div>
        <img id="edit__preview" src="${characterStore.state.selectedCharacter.pic_url}"/>
      </div>
      <button class="btn btn--save">저장</button>`;
  
    // 닫기 버튼 제어
    const closeBtnEl = this.el.querySelector('.material-symbols-outlined');
    closeBtnEl.addEventListener('click', () => {
      this.el.classList.add('hide');
      document.querySelector('.body').classList.remove('blur');
    })

    let isImgUpdated = false;

    // 이미지 업로드 input 제어
    const imgFile = this.el.querySelector('.img-file');
    imgFile.addEventListener('change', () => {
      readURL(imgFile, 'edit__preview');
      isImgUpdated = true;
    });
    
    // 저장 버튼 제어
    const saveBtnEl = this.el.querySelector('.btn--save');
    let message = [];

    saveBtnEl.addEventListener('click', async () => {
      const name = this.el.querySelector('.name');
      const age = this.el.querySelector('.age');
      const nationality = this.el.querySelector('.nationality');
      const filmography = this.el.querySelector('.filmography');

      const character = characterStore.state.selectedCharacter;

      character.name = name.value.trim() ? name.value.trim() : message.push('이름을 입력해 주세요!');
      character.age = age.value.trim() ? age.value.trim() :  message.push('나이를 입력해 주세요!');
      character.nationality = nationality.value.trim() ? nationality.value.trim() : message.push('국적을 입력해 주세요!');
      character.filmography = filmography.value.trim() ? filmography.value.trim() : message.push('필모를 입력해 주세요!');
      character.imgFile = imgFile.files[0];

      if (!isImgUpdated) {
        characterStore.state.selectedCharacter.imgFile = "no-change";
      }

      // 입력값 체크
      if (message.length > 0) {
        await Swal.fire({
          icon: 'error',
          html: message.join('<br/>'),
          confirmButtonText: '확인',
          width: '300px',
          background: '#0C2C5A',
          color: '#BDBDBD',
          confirmButtonColor: '#3C5087',
        })
        message = [];
        return;
      }
      
      
      try {
        // DB에 저장
        await editData();
        // 메세지
        await Swal.fire({
          title: '성공!',
          text: '캐릭터 수정을 완료했어요!',
          icon: 'success',
          confirmButtonText: '확인',
          width: '300px',
          background: '#0C2C5A',
          color: '#BDBDBD',
          confirmButtonColor: '#3C5087',
        })

      } catch (error) {
        await Swal.fire({
          title: '실패!',
          text: '캐릭터 수정을 실패했어요!',
          icon: 'error',
          confirmButtonText: '확인',
          width: '300px',
          background: '#0C2C5A',
          color: '#BDBDBD',
          confirmButtonColor: '#3C5087',
        })
        console.log("편집에러 : ", error);
      } finally {
        // 페이지 리로드
        location.reload();
        // 창 닫기
        // this.el.classList.add('hide');
        // document.querySelector('.body').classList.remove('blur');
      }
    })

  }
}