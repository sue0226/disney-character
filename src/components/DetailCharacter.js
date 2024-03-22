import { Component } from "../core/hello";
import characterStore, { deleteData } from "../store/characters";

export default class DetailCharacter extends Component {

  constructor() {
    super({tagName: 'section'});
    characterStore.subscribe('selectedCharacter', () => {
      this.render(false);
    }) 
  }
  render(isHide = true) {

    const character = characterStore.state.selectedCharacter;

    if (character.length === 0) {
      // 에러메세지
      console.log("캐릭터 안 골라졌는데...? 여긴 어쩐 일로?")
    }
    isHide ? this.el.classList.add('detail', 'hide') : this.el.classList.add('detail');
    
    this.el.innerHTML = /* html */`
    <span class="material-symbols-outlined">close</span>
    <span class="text-box">캐릭터 상세</span>
    <div>
      <div class="field-name">이름 : </div>
      ${character.name}
    </div>
    <div>
      <div class="field-name">나이 : </div>
      ${character.age}
    </div>
    <div>
      <div class="field-name">국적 :  </div>
      ${character.nationality}
    </div>
    <div>
      <div class="field-name">필모그래피 : </div>
      ${character.filmography}
    </div>
    <div>
      <img src="${character.pic_url}" width="100px" height="100px" />
    </div>
    <div class ="detail__btns">
    <button class = "btn btn--edit">편집</button>
    <button class = "btn btn--delete">삭제</button>
    <div>
    `;

    // 닫기 버튼 제어
    const closeBtnEl = this.el.querySelector('.material-symbols-outlined');
    closeBtnEl.addEventListener('click', () => {
      this.el.classList.add('hide');
      document.querySelector('.body').classList.remove('blur');
    })

    // 편집 버튼 제어
    const editBtnEl = this.el.querySelector('.btn--edit');
    editBtnEl.addEventListener('click', () => {
      document.querySelector('.edit').classList.remove('hide');
      this.el.classList.add('hide');
    })
    
    // 삭제 버튼 제어
    const delBtnEl = this.el.querySelector('.btn--delete');
    delBtnEl.addEventListener('click', async () => {
      // 취소 확인 창
      const res = await Swal.fire({
        text: character.name + '을(를) 정말 삭제하시겠어요?' ,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '확인',
        cancelButtonText: '취소',
        width: '300px',
        background: '#0C2C5A',
        color: '#BDBDBD',
        confirmButtonColor: '#3C5087',
        cancelButtonColor: '#BDBDBD'
      })
      // 취소버튼 처리
      if (res.isDismissed) return;

      try {
        await deleteData();
        await Swal.fire({
          title: '성공!',
          text: '캐릭터 삭제를 완료했어요!',
          icon: 'success',
          confirmButtonText: '확인',
          width: '300px',
          background: '#0C2C5A',
          color: '#BDBDBD',
          confirmButtonColor: '#3C5087',
        })
        // 삭제 완료 알림창
      } catch (error) {
        await Swal.fire({
          title: '실패!',
          text: '캐릭터 삭제를 실패했어요!',
          icon: 'error',
          confirmButtonText: '확인',
          width: '300px',
          background: '#0C2C5A',
          color: '#BDBDBD',
          confirmButtonColor: '#3C5087',
        })
        console.log("삭제 에러 : ", error);
      } finally {
        location.reload();
        //  창 닫기
        // this.el.classList.add('hide');
        // document.querySelector('.body').classList.remove('blur');
      }

    })

  }
}