import {getRepository, getConnection, getManager} from "typeorm";
import { fstat } from "node:fs";

export class CommunityController {

    // 커뮤니티 게시글 조회
    static getCommunityList = async (req, res) => {
        const {userId, country, group, reaction} = req.body;
        const entityManager = getManager();

        // 조회 query 생성 
        var selectQuery = "     select case when coalesce(ui.user_profile,'') = '' then '' "
                        + "                 else concat('http://3.36.212.129:8080/',coalesce(ui.user_profile,'')) "
                        + "            end as userProfile "
                        + "          , case when coalesce(cp2.photoPath,'') = '' then '' "
                        + "                 else concat('http://3.36.212.129:8080/',coalesce(cp2.photoPath,'')) "
                        + "            end as thumbnail "
                        + "          , ci.user_id as userId "
                        + "          , ci.community_no as communityNo "
                        + "          , ci.content as content "
                        + "          , ci.country as country "
                        + "          , ci.group_name as groupName "
                        + "          , ci.area_name as areaName "
                        + "          , ci.reaction as reaction "
                        + "          , ci.mark as mark "
                        + "          , coalesce(cp.photoPaths,'') as photoPaths "
                        + "          , coalesce(cp.photoCount,0) as photoCount "
                        + "          , coalesce(cr.replyCount,0) as replyCount "
                        + "          , coalesce(cc.likeCount, 0) as likeCount "
                        + "          , date_format(ci.reg_date, '%Y.%m.%d') as regDate "
                        + "          , coalesce((select count(*) "
                        + "                      from   community_contect "
                        + "                      where  user_id = ci.user_id "
                        + "                        and  community_no = ci.community_no "
                        + "                        and  auser_id = '" + userId + "'), 0) likeYn "
                        + "    from   community_info ci "
                        + "    inner join user_info ui "
                        + "            on ci.user_id = ui.user_id "
                        + "    left outer join (select user_id "
                        + "                          , community_no "
                        + "                          , photo_path as photoPath "
                        + "                     from   community_photo "
                        + "                     where  photo_no = 1) cp2 "
                        + "                 on ci.user_id = cp2.user_id "
                        + "                and ci.community_no = cp2.community_no "
                        + "    left outer join (select user_id "
                        + "                          , community_no "
                        + "                          , group_concat(concat('http://3.36.212.129:8080/', photo_path)) as photoPaths "
                        + "                          , count(*) as photoCount "
                        + "                     from   community_photo "
                        + "                     group by  user_id, community_no) cp "
                        + "                 on ci.user_id = cp.user_id "
                        + "                and ci.community_no = cp.community_no "
                        + "    left outer join (select user_id  "
                        + "                          , community_no "
                        + "                          , count(*) likeCount "
                        + "                     from   community_contect "
                        + "                     group by user_id, community_no) as cc "
                        + "                 on ci.user_id = cc.user_id "
                        + "                and ci.community_no = cc.community_no "
                        + "    left outer join (select user_id  "
                        + "                          , community_no "
                        + "                          , count(*) replyCount "
                        + "                     from   community_reply "
                        + "                     group by user_id, community_no) as cr "
                        + "                 on ci.user_id = cr.user_id "
                        + "                and ci.community_no = cr.community_no "
                        + "    where  ci.user_id != 'admin'";

        // 검색조건이 있을 시 해당 쿼리 추가
        console.log(country + ", " + group + ", " + reaction);
        if (country != '' && country != undefined){
            selectQuery += "      and ci.country = '" + country + "' "
        }

        if (group != '' && group != undefined){
            selectQuery += "      and (ci.group_name like '%" + group + "%' or ci.content like '%" + group + "%') "
        }

        if (reaction != '' && reaction != undefined){
            selectQuery += "      and ci.reaction like '%" + reaction + "%' "
        }

        selectQuery += "    order by ci.reg_date desc ";
        
        console.log(selectQuery);

        var selectResult = await entityManager.query(selectQuery);

        var resultList = [];

        for (var i = 0 ; i < selectResult.length ; i++){
            var sr = JSON.parse(JSON.stringify(selectResult[i]));
            var userId1 = sr.userId;
            var communityNo = sr.communityNo;

            var selectReplyList = "select community_no as communityNo, reply_no as replyNo, auser_id as auserId, content, date_format(reg_date, '%Y.%m.%d') as regDate " 
                                + "from community_reply "
                                + "where user_id = '" + userId1 + "' " 
                                + "  and community_no = " + communityNo + " "
                                + "order by reply_no desc "
                                + "limit 3 ";
            var resultReplyList = JSON.parse(JSON.stringify(await entityManager.query(selectReplyList)));
            
            var result = {
                    sr
                  , resultReplyList
            }
            resultList.push(result);
        }

        res.json(resultList);
    }

    // 커뮤니티 게시글 조회(본인등록)
    static getMyCommunityList = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId} = req.body;
        const entityManager = getManager();

        // 조회 query 생성 
        var selectQuery = "    select case when coalesce(ui.user_profile,'') = '' then '' "
                        + "                else concat('http://3.36.212.129:8080/',coalesce(ui.user_profile,'')) "
                        + "           end as userProfile "
                        + "         , case when coalesce(cp2.photoPath,'') = '' then '' "
                        + "                else concat('http://3.36.212.129:8080/',coalesce(cp2.photoPath,'')) "
                        + "           end as thumbnail "
                        + "         , ci.user_id as userId "
                        + "         , ci.community_no as communityNo "
                        + "         , ci.content as content "
                        + "          , ci.country as country "
                        + "          , ci.group_name as groupName "
                        + "          , ci.area_name as areaName "
                        + "          , ci.reaction as reaction "
                        + "          , ci.mark as mark "
                        + "         , coalesce(cp.photoPaths,'') as photoPaths "
                        + "         , coalesce(cp.photoCount,0) as photoCount "
                        + "         , coalesce(cr.replyCount,0) as replyCount "
                        + "         , coalesce(cc.likeCount, 0) as likeCount "
                        + "         , date_format(ci.reg_date, '%Y.%m.%d') as regDate "
                        + "         , coalesce((select count(*) "
                        + "                     from   community_contect "
                        + "                     where  user_id = ci.user_id "
                        + "                       and  community_no = ci.community_no "
                        + "                       and  auser_id = '" + userId + "'), 0) likeYn "
                        + "    from   community_info ci "
                        + "    inner join user_info ui "
                        + "        on ci.user_id = ui.user_id "
                        + "    left outer join (select user_id "
                        + "                          , community_no "
                        + "                          , photo_path as photoPath "
                        + "                     from   community_photo "
                        + "                     where  photo_no = 1) cp2 "
                        + "                 on ci.user_id = cp2.user_id "
                        + "                and ci.community_no = cp2.community_no "
                        + "    left outer join (select user_id "
                        + "                          , community_no "
                        + "                          , group_concat(concat('http://3.36.212.129:8080/', photo_path)) as photoPaths "
                        + "                          , count(*) as photoCount "
                        + "                     from   community_photo "
                        + "                     group by  user_id, community_no) cp "
                        + "                 on ci.user_id = cp.user_id "
                        + "                 and ci.community_no = cp.community_no "
                        + "    left outer join (select user_id  "
                        + "                          , community_no "
                        + "                          , count(*) likeCount "
                        + "                     from   community_contect "
                        + "                     group by user_id, community_no) as cc "
                        + "                 on ci.user_id = cc.user_id "
                        + "                and ci.community_no = cc.community_no "
                        + "    left outer join (select user_id  "
                        + "                          , community_no "
                        + "                          , count(*) replyCount "
                        + "                     from   community_reply "
                        + "                     group by user_id, community_no) as cr "
                        + "                 on ci.user_id = cr.user_id "
                        + "                and ci.community_no = cr.community_no "
                        + "    where ci.user_id = '" + userId + "' "
                        + "    order by ci.reg_date desc ";

        var selectResult = await entityManager.query(selectQuery);

        res.json(selectResult);
    }

    // 커뮤니티 게시글 조회
    static getCommunityDetail = async (req, res) => {
        const {userId, communityNo, auserId} = req.body;
        const entityManager = getManager();

        // 조회 query 생성 
        var selectQuery = "    select case when coalesce(ui.user_profile,'') = '' then '' "
                        + "                else concat('http://3.36.212.129:8080/',coalesce(ui.user_profile,'')) "
                        + "           end as userProfile "
                        + "         , case when coalesce(cp2.photoPath,'') = '' then '' "
                        + "                else concat('http://3.36.212.129:8080/',coalesce(cp2.photoPath,'')) "
                        + "           end as thumbnail "
                        + "         , ci.user_id as userId "
                        + "         , ci.community_no as communityNo "
                        + "         , ci.content as content "
                        + "          , ci.country as country "
                        + "          , ci.group_name as groupName "
                        + "          , ci.area_name as areaName "
                        + "          , ci.reaction as reaction "
                        + "          , ci.mark as mark "
                        + "         , coalesce(cp.photoPaths,'') as photoPaths "
                        + "         , coalesce(cp.photoCount,0) as photoCount "
                        + "         , coalesce(cr.replyCount,0) as replyCount "
                        + "         , coalesce(cc.likeCount, 0) as likeCount "
                        + "         , date_format(ci.reg_date, '%Y.%m.%d') as regDate "
                        + "         , coalesce((select count(*) "
                        + "                     from   community_contect "
                        + "                     where  user_id = ci.user_id "
                        + "                       and  community_no = ci.community_no "
                        + "                       and  auser_id = '" + userId + "'), 0) likeYn "
                        + "    from   community_info ci "
                        + "    inner join user_info ui "
                        + "            on ci.user_id = ui.user_id "
                        + "    left outer join (select user_id "
                        + "                          , community_no "
                        + "                          , photo_path as photoPath "
                        + "                     from   community_photo "
                        + "                     where  photo_no = 1) cp2 "
                        + "                 on ci.user_id = cp2.user_id "
                        + "                and ci.community_no = cp2.community_no "
                        + "    left outer join (select user_id "
                        + "                          , community_no "
                        + "                          , group_concat(concat('http://3.36.212.129:8080/', photo_path)) as photoPaths "
                        + "                          , count(*) as photoCount "
                        + "                     from   community_photo "
                        + "                     group by  user_id, community_no) cp "
                        + "                 on ci.user_id = cp.user_id "
                        + "                and ci.community_no = cp.community_no "
                        + "    left outer join (select user_id  "
                        + "                          , community_no "
                        + "                          , count(*) likeCount "
                        + "                     from   community_contect "
                        + "                     group by user_id, community_no) as cc "
                        + "                 on ci.user_id = cc.user_id "
                        + "                and ci.community_no = cc.community_no "
                        + "    left outer join (select user_id  "
                        + "                          , community_no "
                        + "                          , count(*) replyCount "
                        + "                     from   community_reply "
                        + "                     group by user_id, community_no) as cr "
                        + "                 on ci.user_id = cr.user_id "
                        + "                and ci.community_no = cr.community_no "
                        + "    where  ci.user_id = '" + auserId + "' "
                        + "      and  ci.community_no = " + communityNo + " ";

        var selectResult = await entityManager.query(selectQuery);

        res.send(selectResult[0]);
    }

    // 커뮤니티 게시글 등록
    static insertCommunity = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId, content, country, groupName, areaName} = req.body;
        const entityManager = getManager();
        const request = require('request');

        // 마지막으로 등록한 게시글 번호 가져오기 
        var selectQuery1 = "select max(community_no) as lastNo from community_info where user_id = '" + userId + "'";
        var selectResult1 = await entityManager.query(selectQuery1);
        var result1 = JSON.parse(JSON.stringify(selectResult1[0]));
        var lastNo = result1.lastNo;

        // 반응 생성
        var reaction = '';
        
        const options = {
            uri:'http://kyugyut.iptime.org:5000/getLabels', 
            method: 'GET',
            body: {
              review:content
            },
            json:true
        }
        request(options, function(err,response,body){
            reaction = body.labels[0];

            // // 게시글 insert query 생성
            var insertQuery1 = "insert into community_info (user_id, community_no, content, country, group_name, area_name, reaction, reg_date, mod_date) "
                            + "values ('"
                            + userId + "', '"
                            + (lastNo + 1) + "', '"
                            + content + "', '"
                            + country + "', '"
                            + groupName + "', '"
                            + areaName + "', '"        // reaction 추가 예정
                            + reaction + "', now(), now())";

            // 게시글 insert query 실행   
            console.log(insertQuery1);       
            entityManager.query(insertQuery1);
        });

        // var selectQuery2 = "select max(community_no) as no from community_info where user_id = '" + userId + "'";
        // console.log(selectQuery2);
        // var selectResult2 = entityManager.query(selectQuery2);
        // var result2 = JSON.parse(JSON.stringify(selectResult2[0]));
        var no = (lastNo + 1);
        console.log(req.files);

        // 업로드된 사진 등록작업
        if (req.files != undefined) {
            var photos = JSON.parse(JSON.stringify(req.files));

            try {
                // 이미지 업로드 
                for (var i = 0 ; i < photos.length ; i++){

                    var insertQuery2 = "insert into community_photo (user_id, community_no, photo_no, photo_path) "
                                    + "values ('"
                                    + userId + "', "
                                    + no + ", "
                                    + (i+1) + ", '"
                                    + "uploads/" + photos[i].filename + "') ";

                    console.log(insertQuery2);
                    entityManager.query(insertQuery2);
                }
            } catch (exception){
                console.log(exception);
            }
        }

        // 글 작성자가 관리자일 경우 Push 전송(공지)
        if (userId == 'admin'){
            try {
                console.log('admin push start ==>');
                
                /* push 설정 */
                var admin = require("firebase-admin");
                var serviceAccount = require("../controller/fcm/earth-project-b792f-firebase-adminsdk-x41d4-23c9a4ad75.json");

                if (!admin.apps.length){
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount)
                    });
                } else {
                    admin.app();
                }

                var selectQuery = "select user_token from user_info where user_push_chk = '1' and user_token is not null and user_token != ''";
                var selectResult = await entityManager.query(selectQuery);
                var tokenList = JSON.parse(JSON.stringify(selectResult));

                for (var i = 0; i < selectResult.length; i++){
                    var deviceToken = tokenList[i].user_token;
                    console.log(deviceToken);

                    let message = {
                        data:{
                            title: '마리봉',
                            body: '공지가 등록되었습니다.',
                        },
                        token:deviceToken,
                    }

                    admin
                        .messaging()
                        .send(message)
                        .then(function(response){
                            console.log('Successfully sent message:', response)
                        })
                        .catch(function(err) {
                            console.log('Error Sending message!!! : ', err)
                        });
                }
                console.log('admin push end ==>');
            } catch (exception){
                console.log(exception);
            }
        }

        // 등록 완료되면 Success 리턴
        res.json({result:"success"});
    }

    // 커뮤니티 게시글 수정
    static updateCommunity = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId, communityNo, content, country, groupName, areaName} = req.body;
        const entityManager = getManager();
        const request = require('request');

        // 반응 생성
        var reaction = '';
        
        const options = {
            uri:'http://kyugyut.iptime.org:5000/getLabels', 
            method: 'GET',
            body: {
              review:content
            },
            json:true
          }

        request.get(options, function(err,response,body){
            reaction = body.labels[0];

            var updateQuery = "update community_info set "
                            + "content = '" + content + "', "
                            + "reaction = '" + reaction + "', "
                            + "country = '" + country + "', "
                            + "group_name = '" + groupName + "', "
                            + "area_name = '" + areaName + "', "
                            + "mod_date = now() "
                            + "where user_id = '" + userId + "' "
                            + "  and community_no = " + communityNo;
            console.log(updateQuery);
            entityManager.query(updateQuery);
        });

        res.json({result:"success"});
    }

    // 커뮤니티 게시글 이미지 수정
    static updateCommunityImg = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId, communityNo} = req.body;
        const entityManager = getManager();

        // photo_no 최대값 구하기
        var selectQuery = "select count(*) + 1 as seq from community_photo where user_id = '" + userId + "' and community_no = "  + communityNo;
        var selectResult = await entityManager.query(selectQuery);
        var maxSeq = selectResult[0].seq;

        // 새로 업로드한 이미지 등록
        var photos = JSON.parse(JSON.stringify(req.files));

        try {
            // 이미지 업로드 
            for (var i = 0 ; i < photos.length ; i++){

                var insertQuery1 = "insert into community_photo (user_id, community_no, photo_no, photo_path) "
                                 + "values ('"
                                 + userId + "', "
                                 + communityNo + ", "
                                 + (parseInt(maxSeq) + i)
                                 + ", 'uploads/" + photos[i].filename + "')";

                console.log(insertQuery1);
                await entityManager.query(insertQuery1);
            }
        } catch (exception){
            console.log(exception);
            res.json({result:"fail"});
        }

        res.json({result:"success"});
    }

    static deleteCommunityImg = async (req, res) => {
        const {imgPath} = req.body;
        const entityManager = getManager();

        let rpPath = imgPath;
        rpPath = rpPath.replace('http://3.36.212.129:8080/', '');

        console.log(rpPath);

        const fs = require('fs');
        fs.unlink(rpPath, function(err){
            if(err)throw err;
        });

        var deleteQuery = "delete from community_photo where photo_path = '" + rpPath + "'";

        await entityManager.query(deleteQuery);
        
        res.json({result:"success"});
    }

    // 커뮤니티 게시글 삭제 
    static deleteCommunity = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId, communityNo} = req.body;
        const entityManager = getManager();

        // 이미지 삭제 
        var selectImgQuery = "select photo_path as img_path from community_photo where user_id = '" + userId + "' and community_no = " + communityNo;
        var resultImg = await entityManager.query(selectImgQuery);

        // 등록된 이미지가 있으면 파일 삭제 
        for (var i = 0 ; i < resultImg.length; i++ ) {
                const fs = require('fs');
                fs.unlink(resultImg[i].img_path, function(err){
                    if(err)throw err;
                });
        }

        var deleteImgQuery = "delete from community_photo where user_id = '" + userId + "' and community_no = " + communityNo;
        console.log(deleteImgQuery);
        await entityManager.query(deleteImgQuery);

        // 댓글 삭제
        var deleteReplyQuery = "delete from community_reply where user_id = '" + userId + "' and community_no = " + communityNo;
        console.log(deleteReplyQuery);
        await entityManager.query(deleteReplyQuery);

        // 게시글 삭제 
        var deleteBoardQuery = "delete from community_info where user_id = '" + userId + "' and community_no = " + communityNo;
        console.log(deleteBoardQuery);
        await entityManager.query(deleteBoardQuery);

        // 삭제 완료되면 Success 리턴
        res.json({result:"success"});
    }

    // 댓글조회
    static getReplyList = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId, communityNo} = req.body;
        const entityManager = getManager();

        var selectQuery = "select community_no as communityNo "
                        + "     , reply_no as replyNo "
                        + "     , auser_id as auserId "
                        + "     , content "
                        + "     , date_format(reg_date, '%Y.%m.%d') as regDate "
                        + "from   community_reply "
                        + "where  user_id = '" + userId + "' "
                        + "  and  community_no = " + communityNo + " "
                        + "order by reg_date desc";
        var selectResult = await entityManager.query(selectQuery);

        res.send(selectResult);
    }

    // 댓글등록
    static insertReply = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId, communityNo, auserId, content} = req.body;
        const entityManager = getManager();

        var selectQuery = "select max(coalesce(reply_no,0)) as cnt from community_reply where user_id = '" + userId + "' and community_no = " + communityNo;
        var selectResult = await entityManager.query(selectQuery);
        var result = selectResult[0].cnt * 1 + 1;

        var insertQuery = "insert into community_reply (user_id, community_no, reply_no, auser_id, content) "
                        + "values ('" + userId + "', " + communityNo + ", " + result + ", '" + auserId + "', '" + content + "')";

        await entityManager.query(insertQuery);
        
        /* push 설정 */
        var selectQuery1 = "select user_token from user_info where user_id ='" + userId + "' and user_push_chk = '1' and user_token is not null and user_token != ''";
        var selectResult1 = await entityManager.query(selectQuery1);
        
        if (selectResult1.length > 0) {
            try {
                console.log('like push start ==>');

                var deviceToken = JSON.parse(JSON.stringify(selectResult1[0].user_token));
                console.log(deviceToken);

                var admin = require("firebase-admin");
                var serviceAccount = require("../controller/fcm/earth-project-b792f-firebase-adminsdk-x41d4-23c9a4ad75.json");

                if (!admin.apps.length){
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount)
                    });
                } else {
                    admin.app();
                }

                let message = {
                    data:{
                        title: '마리봉',
                        body: auserId + '님이 댓글을 등록했습니다.',
                    },
                    token:deviceToken,
                }

                admin
                    .messaging()
                    .send(message)
                    .then(function(response){
                        console.log('Successfully sent message:', response)
                    })
                    .catch(function(err) {
                        console.log('Error Sending message!!! : ', err)
                    });

                console.log('reply push end ==>');
            } catch (exception){
                console.log(exception);
            }
        }


        selectQuery = "select reply_no as replyNo, auser_id auserId, content, date_format(reg_date, '%Y.%m.%d') as regDate "
                    + "from   community_reply "
                    + "where  user_id = '" + userId + "' "
                    + "  and  community_no = " + communityNo + " "
                    + "  and  reply_no = " + result;

        console.log(selectQuery);
        
        selectResult = await entityManager.query(selectQuery);

        res.send(selectResult[0]);
    }

    // 댓글수정
    static updateReply = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId, communityNo, replyNo, auserId, content} = req.body;
        const entityManager = getManager();

        var insertQuery = "update community_reply set "
                        + "content = '" + content + "' "
                        + "mod_date = now() "
                        + "where user_id = '" + userId + "' and community_no = " + communityNo + " and reply_no = " + replyNo + " and auser_id = '" + auserId + "'";

        await entityManager.query(insertQuery);

        res.json({result:"success"});
    }

    // 댓글삭제
    static deleteReply = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId, communityNo, replyNo, auserId} = req.body;
        const entityManager = getManager();

        var deleteQuery = "delete from community_reply "
                        + "where user_id = '" + userId + "' and community_no = " + communityNo + " and reply_no = " + replyNo + " and auser_id = '" + auserId + "'";

        await entityManager.query(deleteQuery);

        res.json({result:"success"});
    }

     // 좋아요 조회
     static getContect = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId, communityNo, auserId} = req.body;
        const entityManager = getManager();

        var selectQuery = "select auser_id as auserId "
                        + "from   community_contect "
                        + "where  user_id = '" + userId + "' "
                        + "  and  community_no = " + communityNo + " "
                        + "  and  auser_id = '" + auserId + "' ";

        var selectResult = await entityManager.query(selectQuery);

        res.send(selectResult[0]);
    }

    // 좋아요 등록
    static insertContect = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId, communityNo, auserId} = req.body;
        const entityManager = getManager();

        try {
            var insertQuery = "insert into community_contect (user_id, community_no, auser_id) "
                            + "values ('" + userId + "', " + communityNo + ", '" + auserId + "')";

            await entityManager.query(insertQuery);
        } catch (exception) {
            res.json({result:"fail"});
        }

        var selectQuery = "select user_token from user_info where user_id ='" + userId + "' and user_push_chk = '1' and user_token is not null and user_token != ''";
        var selectResult = await entityManager.query(selectQuery);

        /* push 설정 */
        if (selectResult.length > 0) {
            try {
                console.log('like push start ==>');

                var deviceToken = JSON.parse(JSON.stringify(selectResult[0].user_token));
                console.log(deviceToken);

                var admin = require("firebase-admin");
                var serviceAccount = require("../controller/fcm/earth-project-b792f-firebase-adminsdk-x41d4-23c9a4ad75.json");

                if (!admin.apps.length){
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount)
                    });
                } else {
                    admin.app();
                }

                let message = {
                    data:{
                        title: '마리봉',
                        body: auserId + '님이 좋아요를 눌렀습니다.',
                    },
                    token:deviceToken,
                }

                admin
                    .messaging()
                    .send(message)
                    .then(function(response){
                        console.log('Successfully sent message:', response)
                    })
                    .catch(function(err) {
                        console.log('Error Sending message!!! : ', err)
                    });

                console.log('like push end ==>');
            } catch (exception){
                console.log(exception);
            }
        }

        res.json({result:"success"});
    }

    // 좋아요 취소
    static deleteContect = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId, communityNo, auserId} = req.body;
        const entityManager = getManager();

        try {
            var deleteQuery = "delete from community_contect "
                            + "where user_id = '" + userId + "' and community_no = " + communityNo + " and auser_id = '" + auserId + "'";

            console.log(deleteQuery);
            await entityManager.query(deleteQuery);
        } catch (exception) {
            res.json({result:"fail"});
        }

        res.json({result:"success"});
    }
}