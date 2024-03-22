import { getStorage, ref, uploadBytes, getDownloadURL  } from "firebase/storage";
import { doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, getCountFromServer, collection, query, orderBy, startAfter, limit, serverTimestamp } from "firebase/firestore";
import { Store } from '../core/hello';
import { db, characterTable } from '../core/firebase';


const store = new Store({
  searchText: '',
  page: 1,
  viewPerPage: 5,
  characters: [],
  totalCount: 0,
  searchedCount: 0,
  addCharacter: {},
  selectedCharacter: {},
  lastVisible: {},
  dummyImage: "https://firebasestorage.googleapis.com/v0/b/friend-list-practice.appspot.com/o/no-image.jpg?alt=media&token=5b83a080-782d-4d81-8fe3-d1ffe6f0c956"
});
export default store;

// 검색 리스트 가져오기
export const getSearchedList = async () => {

  try{
    // 모든 데이터 중에서 검색하기 위해서 일단 현재 정보를 초기화 하고 데이터를 가져온다.
    store.state.characters = [];
    store.state.page = 1;
    await getListAll();

    if (store.state.searchText) {
      let searchKey = new RegExp(store.state.searchText,'i');
      // 검색어를 포함하고 있는 리스트 추출
      const result = store.state.characters.filter(character => {  
        return searchKey.test(character.name);
      })
      
      // 검색결과 건수를 저장
      store.state.searchedCount = result.length;

      // 검색 결과를 pagePerView 만큼씩 잘라서 배열로 저장
      // [[{},{}],[{},{}]...] 의 형태
      let charBigArr = [];
      let charSmallArr =  [];
      let pageIndex = 1; 

      result.map((character, index, array) => {  

        charSmallArr.push(character);

        if (index + 1 === store.state.viewPerPage * pageIndex ) {
          charBigArr.push(charSmallArr);
          charSmallArr = [];
          pageIndex++;
        // 마지막 요소 
        } else if (array.length === index + 1) {
          charBigArr.push(charSmallArr);
          charSmallArr = [];
        } 
        return charBigArr;
      });
      store.state.characters = charBigArr;
    }
  } catch (error) {
    throw error;
  } 
}

async function getListAll() {
  try{
    const querySnapshot = await getDocs(collection(db, characterTable), orderBy("timestamp", "desc"));
    let objList = [];
    querySnapshot.forEach((doc) => {  
      objList = doc.data();
      // ID 정보 추가
      objList.id = doc.id;
      store.state.characters.push(objList);
    });
  } catch (error) {
    console.log("getListAll 에러 : ", error);
  }
}

// 첫페이지 리스트 가져오기
export async function getFirstList() {

  try {
    const first = query(collection(db, characterTable), orderBy("timestamp","desc"), limit(store.state.viewPerPage));
    const documentSnapshots = await getDocs(first);
  
    // 데이터가 없으면 그대로 종료
    if (!documentSnapshots.docs) return;
    
    // 마지막 데이터를 세팅
    store.state.lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
     
    let objList = [];
    documentSnapshots.forEach((doc) => {  
      // ID 정보 추가
      const record = doc.data();
      record.id = doc.id; 
      objList.push(record);
    })
    store.state.characters.push(objList);
  } catch (error) {
    throw error;
  } 
}

export async function getNextList() {

  if (!store.state.lastVisible) {
    console.log("표시할 데이터가 더 없어용");
    return;
  } 
  try {
    const next = await query(collection(db, characterTable),
    orderBy("timestamp","desc"),
    startAfter(store.state.lastVisible),
    limit(store.state.viewPerPage));

    // 다음 리스트를 가져온다
    const documentSnapshots = await getDocs(next);

    // 리스트가 있으면 마지막 데이터를 세팅한다
    if (documentSnapshots.docs) {
      store.state.lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
      store.state.page += 1;
    } 
    let objList = [];
    documentSnapshots.forEach((doc) => {  
      // ID 정보 추가
      const record = doc.data();
      record.id = doc.id; 
      objList.push(record);
    })
    store.state.characters.push(objList);
  } catch (error) {
    throw error;
  } 
}

// 선택한 캐릭터의 데이터 가져오기
export async function getSelectedCharacter(id) {
  try {
    const docSnap = await getDoc(doc(db, characterTable, id));
    let obj = docSnap.data();
    // ID 추가
    obj.id = id;
    store.state.selectedCharacter = obj;
  } catch (error) {
    throw error;
  }
}

// 데이터 추가
export async function addData () { 
  try {
    // 이미지 파일이 있는지 체크 하고 없으면 더미를 세팅
    if(!store.state.addCharacter.imgFile) {
      store.state.addCharacter.pic_url =  store.state.dummyImage;
   
    // 이미지 파일이 있으면 storage 에 먼저 업로드하고 URL을 세팅
    } else {
      const storage = await getStorage();
      const storageRef = await ref(storage, store.state.addCharacter.imgFile.name);
      const snapshot = await uploadBytes(storageRef, store.state.addCharacter.imgFile);
      store.state.addCharacter.pic_url = await getDownloadURL(snapshot.ref);
    }
    // firebase 데이터 등록 
    const docRef = await addDoc(collection(db, characterTable), {
      name: store.state.addCharacter.name,
      age: store.state.addCharacter.age,
      nationality: store.state.addCharacter.nationality,
      filmography: store.state.addCharacter.filmography,
      pic_url: store.state.addCharacter.pic_url,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    throw error;
  }
}

// 데이터 편집
export async function editData() {
  try {

    console.log(store.state.selectedCharacter.imgFile);
      if (store.state.selectedCharacter.imgFile === "no-change") {
        // firebase 데이터 갱신
        const characterRef = doc(db, characterTable, store.state.selectedCharacter.id);
        await updateDoc(characterRef, {
          name: store.state.selectedCharacter.name,
          age: store.state.selectedCharacter.age,
          nationality: store.state.selectedCharacter.nationality,
          filmography: store.state.selectedCharacter.filmography,
          timestamp: serverTimestamp()
        });  
      } else {
        // 이미지 파일이 있는지 체크 하고 없으면 더미를 세팅
        if(!store.state.selectedCharacter.imgFile) {
          store.state.selectedCharacter.pic_url =  store.state.dummyImage;

        // 이미지 파일이 있으면 storage 에 먼저 업로드하고 URL을 세팅
        } else {
          const storage = await getStorage();
          const storageRef = await ref(storage, store.state.selectedCharacter.imgFile.name);
          const snapshot = await uploadBytes(storageRef, store.state.selectedCharacter.imgFile);
          store.state.selectedCharacter.pic_url = await getDownloadURL(snapshot.ref);
        }
          // firebase 데이터 갱신
        const characterRef = doc(db, characterTable, store.state.selectedCharacter.id);
        await updateDoc(characterRef, {
          name: store.state.selectedCharacter.name,
          age: store.state.selectedCharacter.age,
          nationality: store.state.selectedCharacter.nationality,
          filmography: store.state.selectedCharacter.filmography,
          pic_url: store.state.selectedCharacter.pic_url,
          timestamp: serverTimestamp()
        });  
      }

    } catch (error) {
      throw error;
    }
}

// 데이터 삭제
export async function deleteData() {
  try {
    await deleteDoc(doc(db, characterTable, store.state.selectedCharacter.id));
  } catch (error) {
    throw error;
  }
}

// 데이터 총 건수
export async function totalCount() {
  try{
    const snapshot = await getCountFromServer(collection(db, characterTable));
    store.state.totalCount = snapshot.data().count;
  } catch(e) {
    throw error;
  }
}