import express from 'express';                  /* express 설정 */
import http from "http";                        /* http 설정 - 채팅서버 오픈용 */
import {createConnection} from "typeorm";       /* DB Connection 설정 */
import router from './router';                  /* api 호출을 위한 Router 파일 import */

let app = express();
let server = http.createServer(app);

// 기본적으로 body-parser는 내장되어있지만 json 파싱을 위해 설정 추가
app.use(express.json());

// 미디어 타입 파싱 목적으로 아래 코드를 추가해줘야 한다.
app.use(express.urlencoded({
    extended: true
}));

// root path 설정
app.use('/', router);

// upload file path 설정
app.use('/profile', express.static('profile'));
app.use('/uploads', express.static('uploads'));
app.use('/thumb', express.static('thumb'));

createConnection().then(connection => {
    // DB Connection 연결 설정 및 8080포트로 서버가 오픈되었음을 콘솔에서 확인
    app.listen(8080, () => {
        console.log('RestAPI Server is listening 8080');
    });
});