import { Component, readURL } from "../core/hello";
import characterStore, { addData } from "../store/characters";

export default class AddCharacter extends Component {
  constructor() {
    super({tagName: 'section'});
  }
  render() {
    this.el.classList.add('add', 'hide');
    this.el.innerHTML = /* html */`
    <span class="material-symbols-outlined">close</span>
    <span class="text-box">캐릭터 정보를 입력하세요</span>
    <div>
      <div class="field-name">이름</div>
      <input class="name"/>
    </div>
    <div>
      <div class="field-name">나이</div>
      <input class="age"/>
    </div>
    <div>
      <div class="field-name">국적</div>
      <input class="nationality"/>
    </div>
    <div>
      <div class="field-name">필모그래피</div>
      <input class="filmography"/>
    </div>
    <div>
      <div class="field-name">프로필사진</div>
      <input type="file" class="img-file" accept=".png, .jpeg, .jpg, .webp" />
    </div>
    <div>
      <img id="add__preview" />
  </div>
      <button class="btn btn--save"> 저장 </button>
    `;

    // 닫기 버튼 제어
    const closeEl = this.el.querySelector('.material-symbols-outlined');
    closeEl.addEventListener('click', () => {
      this.el.classList.add('hide');
      document.querySelector('.body').classList.remove('blur');
    })
    // 이미지 업로드 input 제어
    const imgFile = this.el.querySelector('.img-file');
    imgFile.addEventListener('change', () => {
      readURL(imgFile, 'add__preview');
    });

    // 저장 버튼 제어
    const btnEl = this.el.querySelector('.btn--save');
    let message = [];
    
    btnEl.addEventListener('click', async () => {
      const name = this.el.querySelector('.name');
      const age = this.el.querySelector('.age');
      const nationality = this.el.querySelector('.nationality');
      const filmography = this.el.querySelector('.filmography');

      const character = characterStore.state.addCharacter;
      character.name = name.value.trim() ? name.value.trim() : message.push('이름을 입력해 주세요!');
      character.age = age.value.trim() ? age.value.trim() :  message.push('나이를 입력해 주세요!');
      character.nationality = nationality.value.trim() ? nationality.value.trim() : message.push('국적을 입력해 주세요!');
      character.filmography = filmography.value.trim() ? filmography.value.trim() : message.push('필모를 입력해 주세요!');
      character.imgFile = imgFile.files[0];

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

      try{
        // DB에 저장
        await addData();
        // 메시지
        await Swal.fire({
          title: '성공!',
          text: '캐릭터 등록을 완료했어요!',
          icon: 'success',
          confirmButtonText: '확인',
          width: '300px',
          background: '#0C2C5A',
          color: '#BDBDBD',
          confirmButtonColor: '#3C5087',
        })
      } catch (e) {
        await Swal.fire({
          title: '실패!',
          text: '캐릭터 등록을 실패했어요!',
          icon: 'error',
          confirmButtonText: '확인',
          width: '300px',
          background: '#0C2C5A',
          color: '#BDBDBD',
          confirmButtonColor: '#3C5087',
        })
        console.log("저장실패 : ", e);
      } finally {
        // 페이지 리로드 
        location.reload();

         // 창닫기 
        // this.el.classList.add('hide');
        // document.querySelector('.body').classList.remove('blur');
      }
    })
  }
}

