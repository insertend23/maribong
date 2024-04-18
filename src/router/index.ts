import {Router} from "express";                                                                 /* express를 통한 Router 모듈화 */
import {ImgController} from "../controller/ImgController";                                      /* ImgController Import */
import {UserController} from "../controller/UserController";                                    /* UserController Import */
//import {DischargeController} from "../controller/DischargeController";                          /* DischargeController Import */
import {CommunityController} from "../controller/CommunityController";                          /* CommunityController Import */
import {QuizController} from "../controller/QuizController";                                    /* QuizController Import */


/* Router 객체 생성 */
const routes = Router();

/* 이미지 업로드를 위한 multer 객체 생성 */
const multer = require('multer');
const path = require('path');
const upload = multer({
                    storage: multer.diskStorage({
                        destination: function (req, file, cb) {
                            cb(null, 'uploads/');
                        },
                        filename: function (req, file, cb) {
                            var filePath = Math.floor(Math.random() * 1000) + Math.floor(Math.random()) + '_' + new Date().valueOf() + path.extname(file.originalname);
                            cb(null, filePath);
                        }  
                    })
                  , limits: {
                        fileSize : 8 * 1024 * 1024
                    }
                });    

/* Router 객체를 통한 Controller Method 호출 */
/* 공통 */
routes.post('/img/uploadImg', upload.single('photo'), ImgController.uploadImg);                                 // 이미지 업로드(수정작업용)
routes.post('/img/uploadImgList', upload.array('photos'), ImgController.uploadImgList);                         // 게시판 이미지 업로드

/* 1) user_info 테이블 관련 Method */
routes.post('/user/getUserCount', UserController.getUserCount);                                                 // 가입된 회원 수 가져오기               
routes.post('/user/checkUserId', UserController.checkUserId);                                                   // 아이디 중복검사                
routes.post('/user/checkUserName', UserController.checkUserName);                                               // 별명 중복검사                 
routes.post('/user/userInsert', UserController.addUser);                                                        // 회원가입
routes.post('/user/login', UserController.login);                                                               // 로그인
routes.post('/user/getUserInfo', UserController.userInfo);                                                      // 로그인 정보 가저오기
routes.post('/user/userUpdateProfile', upload.single('userProfile'), UserController.modifyUserProfile);         // 프로필사진 변경
routes.post('/user/userDeleteProfile', UserController.deleteUserProfile);                                       // 프로필사진 삭제
routes.post('/user/userUpdateInfo', UserController.modifyUserInfo);                                             // 비밀번호, 별명 변경
routes.post('/user/userUpdatePush', UserController.modifyUserPush);                                             // 푸시 변경
routes.post('/user/getAlerm', UserController.getAlerm);                                                         // 알림내역 가져오기
routes.post('/user/getHistory', UserController.getHistory);                                                     // 봉사인증기록 가져오기

/* 2) discharge_info 테이블 관련 Method */
// routes.post('/discharge/getAutoSearchList', DischargeController.getAutoSearchList);                             // 자동완성 문구 조회
// routes.post('/discharge/getTop3DischargeList', DischargeController.getTop3DischargeList);                       // TOP3 조회하기 
// // routes.post('/discharge/getManyTop3DischargeList', DischargeController.getManyTop3DischargeList);               // 분리배출 최다등록 TOP3 조회하기
// // routes.post('/discharge/getLastTop3DischargeList', DischargeController.getLastTop3DischargeList);               // 분리배출 최근등록 TOP3 조회하기
// routes.post('/discharge/getDischargeList', DischargeController.getDischargeList);                               // 분리배출 조회하기
// routes.post('/discharge/getMyDischargeList', DischargeController.getMyDischargeList);                           // 분리배출 조회(본인등록)
// routes.post('/discharge/getDischargeDetail', DischargeController.getDischargeDetail);                           // 분리배출 상세조회
// routes.post('/discharge/insertDischarge', upload.single('picture'), DischargeController.insertDischarge);       // 분리배출 등록하기
// routes.post('/discharge/deleteDischarge', DischargeController.deleteDischarge);                                 // 분리배출 삭제하기
// routes.post('/discharge/updatePicture', upload.single('picture'), DischargeController.updatePicture);           // 분리배출 사진수정
// routes.post('/discharge/updateDischarge', upload.single('dummy'), DischargeController.updateDischarge);         // 분리배출 수정하기

/* 3) community_info 테이블 관련 Method */
/* (1) 커뮤니티 게시글 */
routes.post('/community/getCommunityList', CommunityController.getCommunityList);                               // 게시글 조회
routes.post('/community/getMyCommunityList', CommunityController.getMyCommunityList);                           // 게시글 조회(본인등록)
routes.post('/community/getCommunityDetail', CommunityController.getCommunityDetail);                           // 게시글 상세보기
routes.post('/community/insertCommunity', upload.array('picture'), CommunityController.insertCommunity);        // 게시글 등록
routes.post('/community/updateCommunity', CommunityController.updateCommunity);                                 // 게시글 수정
routes.post('/community/updateCommunityImg', upload.array('picture'), CommunityController.updateCommunityImg);  // 게시글 이미지 수정
routes.post('/community/deleteCommunityImg', CommunityController.deleteCommunityImg);                           // 게시글 이미지 삭제
routes.post('/community/deleteCommunity', CommunityController.deleteCommunity);                                 // 게시글 삭제

/* (2) 댓글 */
routes.post('/community/getReplyList', CommunityController.getReplyList);                                       // 댓글조회
routes.post('/community/insertReply', CommunityController.insertReply);                                         // 댓글등록
routes.post('/community/updateReply', CommunityController.updateReply);                                         // 댓글수정
routes.post('/community/deleteReply', CommunityController.deleteReply);                                         // 댓글삭제

/* (3) 좋아요 */
routes.post('/community/getContect', CommunityController.getContect);                                           // 좋아요 조회
routes.post('/community/insertContect', CommunityController.insertContect);                                     // 좋아요 등록
routes.post('/community/deleteContect', CommunityController.deleteContect);                                     // 좋아요 취소

/* 4) 퀴즈 */
routes.post('/quiz/getQuiz', QuizController.getQuiz);                                                          // 퀴즈 가져오기
routes.post('/quiz/sendQuiz', QuizController.sendQuiz);                                                          // 퀴즈 제출

export default routes;