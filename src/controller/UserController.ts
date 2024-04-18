import {getRepository, getConnection, getManager} from "typeorm";
import { fstat } from "node:fs";

export class UserController {

    // 가입된 회원 수 가져오기
    static getUserCount = async (req, res) => {
        const entityManager = getManager();

        var selectQuery = "select count(*) as count from user_info";
        var selectResult = await entityManager.query(selectQuery);
        var result = JSON.parse(JSON.stringify(selectResult[0]));

        res.send(result);
    }

    // 아이디 중복검사
    static checkUserId = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId} = req.body;
        const entityManager = getManager();  

        // ID 중복검사 query 생성
        var selectQuery = "select count(*) as chk from user_info where user_id = '" + userId + "'";
        // ID 중복검사 query 실행
        var selectResult = await entityManager.query(selectQuery);
        var result = JSON.parse(JSON.stringify(selectResult[0]));

        if (result.chk == 0){
            res.json({result:"success"});
        } else {
            res.json({result:"fail"});
        }
    }

    // 별명 중복검사
    static checkUserName = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userName} = req.body;
        const entityManager = getManager();  

        // ID 중복검사 query 생성
        var selectQuery = "select count(*) as chk from user_info where user_name = '" + userName + "'";
        // ID 중복검사 query 실행
        var selectResult = await entityManager.query(selectQuery);
        var result = JSON.parse(JSON.stringify(selectResult[0]));

        if (result.chk == 0){
            res.json({result:"success"});
        } else {
            res.json({result:"fail"});
        }
    }

    // 회원가입
    static addUser = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId, userPwd, userName, token, sex, birthYear, birthMonth} = req.body;
        const entityManager = getManager();

        // ID 중복검사 query 생성
        var selectQuery1 = "select count(*) as chk from user_info where user_id = '" + userId + "'";
        // ID 중복검사 query 실행
        var selectResult1 = await entityManager.query(selectQuery1);
        var result1 = JSON.parse(JSON.stringify(selectResult1[0]));

        if (result1.chk != 0){
            res.json({result:"101"});
            return;
        }

        // 별명 중복검사 query 생성
        var selectQuery2 = "select count(*) as chk from user_info where user_name = '" + userName + "'";
        // 별명 중복검사 query 실행
        var selectResult2 = await entityManager.query(selectQuery2);
        var result2 = JSON.parse(JSON.stringify(selectResult2[0]));

        if (result2.chk != 0){
            res.json({result:"102"});
            return;
        }

        // 중복된 ID, 별명이 없으면 데이터 저장
        if (result1.chk == 0 && result2.chk == 0) {
            // insert query 생성
            var insertQuery = "insert into user_info(user_id, user_pwd, user_name, user_token "
                            + "                    , user_sex, user_birth_year, user_birth_month) "
                            + "values ("
                            + "  '" + userId + "'"
                            + ", '" + userPwd + "'"
                            + ", '" + userName + "'"
                            + ", '" + token + "'"
                            + ", '" + sex + "'"
                            + ", " + birthYear + " "
                            + ", " + birthMonth + " "
                            + ") ";

            console.log(insertQuery);
            
            // insert query 실행          
            await entityManager.query(insertQuery);

            // 회원가입이 완료되면 Success 리턴
            res.json({result:"100"});
        } else {
            res.json({result:"fail"});
        }
    }

    // 로그인 
    static login = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId, userPwd, token} = req.body;
        const entityManager = getManager();

        // 쿼리를 실행했을 때, 결과값이 1이면 계정확인 완료
        var selectQuery1 = "select count(*) as chk from user_info where user_id = '" + userId + "'";
        var selectResult1 = await entityManager.query(selectQuery1);
        var result1 = JSON.parse(JSON.stringify(selectResult1[0]));

        if (result1.chk == 0){
            res.json({result :"101"});
            return;
        }

        // 쿼리를 실행했을 때, 결과값이 1이면 로그인 성공
        var selectQuery2 = "select count(*) as chk from user_info where user_id = '" + userId + "' and user_pwd = '" + userPwd + "'";
        var selectResult2 = await entityManager.query(selectQuery2);
        var result2 = JSON.parse(JSON.stringify(selectResult2[0]));

        // 토큰값 업데이트 
        var updateQuery = "update user_info set user_token = '" + token + "' where user_id = '" + userId + "'";
        await entityManager.query(updateQuery);

        if (result2.chk == 1){
            res.json({result :"100"});
        } else {
            res.json({result :"102"});
        }
    }

    // 사용자 정보 가져오기
    static userInfo = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId} = req.body;
        const entityManager = getManager();

        // 사용자 정보 조회 query 생성 
        var selectQuery = "select concat('http://3.36.212.129:8080/',user_profile) as userProfile "                             // 프로필사진
                        + "     , user_id as userId "                                                                            // 아이디
                        + "     , user_name as userName "                                                                        // 닉네임
                        + "     , case user_sex "
                        + "        when '1' then '남자' "
                        + "        else '여자' "
                        + "       end as sex "                                                                                   // 성별
                        + "     , user_birth_year as birthYear "                                                                 // 생년
                        + "     , user_birth_month as birthMonth "                                                               // 생월
                        + "     , user_push_chk as pushCheck "                                                                   // 푸시 알림여부
                        + "     , coalesce((select count(*) from community_info where user_id = '" + userId + "'),0) as cmCnt "  // 커뮤니티 등록건수
                        + "from user_info where user_id = '" + userId + "'";
        // 사용자 정보 조회 query 실행
        var selectResult = await entityManager.query(selectQuery);

        res.send(selectResult[0]);
    }

    // 프로필 사진 변경 
    static modifyUserProfile = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId} = req.body;
        const entityManager = getManager();

        // 프로필 사진 존재여부 체크
        var query = "select coalesce(user_profile,'') as filePath from user_info where user_id = '" + userId + "'";
        const resultQuery = await entityManager.query(query);
        const path = JSON.parse(JSON.stringify(resultQuery));
        const filePath = path[0].filePath;
        var profile = filePath;

        var userProfile = JSON.parse(JSON.stringify(req.file));
        console.log(profile);
        console.log(userProfile);

        // 기존 프로필 사진이 있으면 해당 파일 삭제 후 진행
        if (userProfile != null) {
            if (filePath != '' && filePath != null){
                const fs = require('fs');
                fs.unlink(filePath, function(err){
                    if(err)throw err;
                });

                profile = userProfile;
            }
        }

        try {
            var originPath = userProfile.path;                        // 원본파일
            var thumbnailPath = 'profile/rs' + userProfile.filename;    // 썸네일 파일(리스트 표시)

            const sharp = require('sharp');
            sharp(originPath)
                .resize({width:200})
                .withMetadata()
                .toFile(thumbnailPath, (err, info) => {
                    const fs = require('fs');
                    if(err) throw err
                    fs.unlink(originPath, (err) => {
                        if(err) throw err
                    })
                });

            // 프로필사진 수정 query 생성
            var updateQuery = "update user_info set "
                            + "user_profile = '" + thumbnailPath + "', "
                            + "mod_date = now() "
                            + "where user_id = '" + userId + "'";
            // 프로필사진 수정 query 실행 
            var updateResult = await entityManager.query(updateQuery);
        } catch (exception){
            console.log(exception);
        }

        console.log(updateResult);

        // 처리결과 return
        if (updateResult.changedRows > 0) {
            res.json({result :"http://3.36.212.129:8080/" + thumbnailPath});
        } else {
            res.json({result :"fail"});
        }
    }

    // 프로필 사진삭제
    static deleteUserProfile = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId} = req.body;
        const entityManager = getManager();

        // 프로필 사진 존재여부 체크
        var query = "select coalesce(user_profile,'') as filePath from user_info where user_id = '" + userId + "'";
        const resultQuery = await entityManager.query(query);
        const path = JSON.parse(JSON.stringify(resultQuery));
        const filePath = path[0].filePath;
        var profile = filePath;

        // 기존 프로필 사진이 있으면 해당 파일 삭제 후 진행
        if (filePath != '' && filePath != null){
            const fs = require('fs');
            fs.unlink(filePath, function(err){
                if(err)throw err;
            });
        }

        try {
            // 프로필사진 수정 query 생성
            var updateQuery = "update user_info set "
                            + "user_profile = '', "
                            + "mod_date = now() "
                            + "where user_id = '" + userId + "'";
            // 프로필사진 수정 query 실행 
            var updateResult = await entityManager.query(updateQuery);
        } catch (exception){
            console.log(exception);
        }

        console.log(updateResult);

        // 처리결과 return
        if (updateResult.changedRows > 0) {
            res.json({result :"success"});
        } else {
            res.json({result :"fail"});
        }
    }

    // 비밀번호, 별명 변경
    static modifyUserInfo = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        console.log(req.body);

        const {userId, userPwd, userName, birthYear, birthMonth, sex, push} = req.body;
        const entityManager = getManager();

        // 별명 중복검사 query 생성
        var selectQuery2 = "select count(*) as chk from user_info where user_name = '" + userName + "' and user_id != '" + userId + "' ";
        console.log(selectQuery2);

        // 별명 중복검사 query 실행
        var selectResult2 = await entityManager.query(selectQuery2);
        var result2 = JSON.parse(JSON.stringify(selectResult2[0]));

        if (result2.chk != 0){
            res.json({result:"102"});
            return;
        }

        // 수정 query 생성
        var updateQuery = "update user_info set "
                        + "user_pwd = '" + userPwd + "', "
                        + "user_name = '" + userName + "', "
                        + "user_birth_year = " + birthYear + ", "
                        + "user_birth_month = " + birthMonth + ", "
                        + "user_sex = '" + sex + "', "
                        + "user_push_chk = '" + push + "', "
                        + "mod_date = now() "
                        + "where user_id = '" + userId + "'";
        // 수정 query 실행 
        var updateResult = await entityManager.query(updateQuery);

        // 처리결과 return
        if (updateResult.changedRows > 0) {
            res.json({result :"100"});
        } else {
            res.json({result :"fail"});
        }
    }

    // 푸시알림 상태변경 
    static modifyUserPush = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId} = req.body;
        const entityManager = getManager();

        var selectQuery = "select case user_push_chk when '1' then '2' else '1' end as flag from user_info where user_id = '" + userId + "'";
        var selectResult = await entityManager.query(selectQuery);
        var result = JSON.parse(JSON.stringify(selectResult[0]));

        // 푸시알림 상태변경 query 생성
        var updateQuery = "update user_info set "
                        + "user_push_chk = " + result.flag + ", "
                        + "mod_date = now() "
                        + "where user_id = '" + userId + "'";
        console.log(updateQuery);
        // 푸시알림 상태변경 query 실행 
        var updateResult = await entityManager.query(updateQuery);

        // 처리결과 return
        if (updateResult.changedRows > 0) {
            res.json({result : result.flag});
        } else {
            res.json({result :"fail"});
        }
    }

    // 알림내역 가져오기 
    static getAlerm = async (req, res) => {

        // Post로 넘어오는 parameter 받기
        const {userId} = req.body;
        const entityManager = getManager();

        var selectQuery = "select category, title1, title2, userId, communityNo "
                        + "from  ( select '1' as category "				            /* 구분 - 1:공지, 2:좋아요, 3:댓글 */
                        + "             , '푸른지구' as title1 "
                        + "             , '<공지>' as title2 "
                        + "             , user_id as userId " 
                        + "             , community_no as communityNo "
                        + "             , reg_date as regDate "
                        + "        from   community_info "
                        + "        where  user_id = 'admin' "
                        + "          and  reg_date = (select max(reg_date) from community_info where user_id = 'admin') "
                        + "        union all "
                        + "        select '2' as category "
                        + "             , cc.auser_id as title1 "
                        + "             , '좋아요를 누름' as title2 "
                        + "             , ci.user_id as userId "
                        + "             , ci.community_no as communityNo "
                        + "             , cc.reg_date as regDate "
                        + "        from   community_info ci inner join community_contect cc "
                        + "                                         on ci.user_id = cc.user_id " 
                        + "                                        and ci.community_no = cc.community_no " 
                        + "        where  ci.user_id = '" + userId + "' "
                        + "          and  cc.auser_id != '" + userId + "' "
                        + "        union all "
                        + "        select '3' as category "
                        + "             , cr.auser_id as title1 "
                        + "             , cr.content as title2 "
                        + "             , ci.user_id as userId "
                        + "             , ci.community_no as communityNo "
                        + "             , cr.reg_date as regDate "
                        + "        from   community_info ci inner join community_reply cr "
                        + "                                         on ci.user_id = cr.user_id " 
                        + "                                        and ci.community_no = cr.community_no " 
                        + "        where  ci.user_id = '" + userId + "' " 
                        + "          and  cr.auser_id != '" + userId + "' "
                        + "     ) as tmp "
                        + " order by case category "
                        + "           when '1' then 1 "
                        + "           else 9 "
                        + "          end asc "
                        + "     , regDate desc";
        var selectResult = await entityManager.query(selectQuery);

        res.send(selectResult);
    }

    // 봉사인증기록 가져오기
    static getHistory = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId} = req.body;
        const entityManager = getManager();

        var selectQuery = "select history_userId as userId "
                        + "     , history_title as title "
                        + "     , term "
                        + "from   history "
                        + "where  history_userId = '" + userId + "'";
        var selectResult = await entityManager.query(selectQuery);

        res.send(selectResult);
    }
}