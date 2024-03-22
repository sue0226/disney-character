import Header from './components/Header';
import CharacterList from './components/CharcterList';
import AddCharacter from './components/AddCharacter';
import DetailCharacter from './components/DetailCharacter';
import EditCharacter from './components/EditCharacter';
import { Component } from './core/hello';


export default class App extends Component {

  render() {

    const root = document.querySelector('#root');
    // header
    const header = new Header().el;
    // 캐릭터리스트
    const characterList = new CharacterList().el;
    // 캐릭터 추가 페이지
    const addCharacter = new AddCharacter().el;
    // 캐릭터 상세 페이지
    const detailCharacter = new DetailCharacter().el;
    // 캐릭터 편집 페이지
    const editCharacter = new EditCharacter().el;
          
    root.append(
      header,
      characterList,
      addCharacter,
      detailCharacter,
      editCharacter
    );
  }
}

