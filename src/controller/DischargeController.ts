import {getRepository, getConnection, getManager} from "typeorm";
import { fstat } from "node:fs";

export class DischargeController {

    // 자동완성 리스트 조회
    static getAutoSearchList = async (req, res) => {
        const {searchWord} = req.body;
        const entityManager = getManager();

        var selectQuery = "select item_title as keyword "
                        + "from  (select distinct item_title "
                        + "       from   discharge_info di " 
                        + "       where  item_title like '%" + searchWord + "%') t";

        console.log("getAutoSearchList --> " + selectQuery);

        var list = await entityManager.query(selectQuery);

        res.send(list);
    }

    static getTop3DischargeList = async (req, res) => {
        const entityManager = getManager();

        // TOP3 조회하기 
        var selectQuery = "select * "
                        + "from ( select 1 as category, di.item_title as itemTitle "
                        + "            , count(*) as itemCount "
                        + "     from   discharge_info di "
                        + "     group by di.item_title "
                        + "     order by itemCount desc "
                        + "     limit 3) T "
                        + "union all "
                        + "select 2 as category "
                        + "     , itemTitle " 
                        + "     , itemCount "
                        + "from (select di.item_title as itemTitle "
                        + "           , (select count(*) from discharge_info where item_title = di.item_title) as itemCount "
                        + "           , reg_date as regDate "
                        + "      from   discharge_info di "
                        + "     order by reg_date desc "
                        + "     limit 3 ) T";

        var list = await entityManager.query(selectQuery);

        res.json(list);
    }

    // // 분리배출 데이터 최다등록 Top3 조회 -> 사용안함
    // static getManyTop3DischargeList = async (req, res) => {
    //     const entityManager = getManager();

    //     // 최다 등록 TOP3 
    //     var selectQuery = "select di.item_title as itemTitle "
    //                     + "     , count(*) as itemCount "
    //                     + "from   discharge_info di "
    //                     + "group by di.item_title "
    //                     + "order by itemCount "
    //                     + "limit 3";

    //     console.log("getManyTop3DischargeList --> " + selectQuery);

    //     var list = await entityManager.query(selectQuery);

    //     res.json(list);
    // }

    // // 분리배출 데이터 최근등록 Top3 조회 -> 사용안함 
    // static getLastTop3DischargeList = async (req, res) => {
    //     const entityManager = getManager();

    //     // 최다 등록 TOP3 
    //     var selectQuery = "select itemTitle "
    //                     + "     , itemCount "
    //                     + "from (select di.item_title as itemTitle "
    //                     + "           , (select count(*) from discharge_info where item_title = di.item_title) as itemCount "
    //                     + "           , reg_date as regDate "
    //                     + "      from   discharge_info di "
    //                     + "      order by reg_date desc "
    //                     + "      limit 3 ) T";

    //     console.log("getLastTop3DischargeList --> " + selectQuery);

    //     var list = await entityManager.query(selectQuery);

    //     res.json(list);
    // }

    // 분리배출 데이터 조회
    static getDischargeList = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {title} = req.body;
        const entityManager = getManager();

        // 사진 리스트 조회(최근 9개)
        var selectQuery1 = "select ui.user_name as userName "
                        + "     , date_format(di.reg_date, '%Y.%m.%d') as regDate "
                        + "     , concat('http://3.36.212.129:8080/',di.item_picture) as picture "
                        + "from   discharge_info di inner join user_info ui "
                        + "                                 on di.user_id = ui.user_id "
                        + "where  item_title like '%" + title + "%' "
                        + "order by di.reg_date desc "
                        + "limit  9"
                        ;
        var list = await entityManager.query(selectQuery1);

        // 전체건수 조회
        var selectQuery2 = "select count(*) cnt from discharge_info where item_title like '%" + title + "%' "
        var selectResult2 = await entityManager.query(selectQuery2);
        var cnt = selectResult2[0].cnt;

        // 포함 재질정보 조회
        var selectQuery3 = "select group_concat(materialName) as materialName "
                         + "from ("
                         + "select distinct "
                         + "        case trim(dm.material_no) "
                         + "         when '2' then '플라스틱' "
                         + "         when '3' then '투명페트' "
                         + "         when '4' then '비닐' "
                         + "         when '5' then '종이' "
                         + "         when '6' then '종이팩' "
                         + "         when '7' then '박스' "
                         + "         when '8' then '캔' "
                         + "         when '9' then '유리' "
                         + "         when '10' then '일반쓰레기' "
                         + "         when '11' then '스티로폼' "
                         + "         when '12' then '고철' "
                         + "         when '13' then '기타' "
                         + "         else '' "
                         + "        end as materialName "
                         + "from   discharge_info di inner join discharge_material dm "
                         + "                                 on di.user_id = dm.user_id "
                         + "                                and di.discharge_no = dm.discharge_no "
                         + "where  di.item_title like '%"+ title + "%') T";
        
        var selectResult3 = await entityManager.query(selectQuery3);
        var materials = selectResult3[0].materialName;

        var selectResult = {
            list
          , cnt
          , materials
        }

        res.json(selectResult);
    }

    // 분리배출 데이터 조회
    static getMyDischargeList = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId} = req.body;
        const entityManager = getManager();

        // 사진 리스트 조회(최근 9개)
        var selectQuery1 = "select di.user_id as userId "
                        + "      , di.discharge_no as dischargeNo "
                        + "      , concat('http://3.36.212.129:8080/',di.item_picture) as picture "
                        + "from   discharge_info di "
                        + "where  di.user_id = '" + userId + "' "
                        + "order by di.reg_date desc ";

        console.log("getMyDischargeList -->" + selectQuery1);

        var list = await entityManager.query(selectQuery1);

        res.json(list);
    }

    // 분리배출 데이터 상세조회
    static getDischargeDetail = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId, dischargeNo} = req.body;
        const entityManager = getManager();

        var selectQuery = "select di.user_id as userId "
                        + "     , di.discharge_no as dischargeNo "
                        + "     , di.item_title as title "
                        + "     , di.item_maker as maker "
                        + "     , concat('http://3.36.212.129:8080/', di.item_picture) as picture "
                        + "     , dcd.categorys as cleanYn "
                        + "     , dm.materials "
                        + "     , di.difficulty_level as level "
                        + "from   discharge_info di "
                        + "inner join (select user_id, discharge_no, GROUP_CONCAT(category_no) categorys "
                        + "            from   discharge_clean_div "
                        + "            where  user_id = '" + userId + "' "
                        + "              and  discharge_no = " + dischargeNo + ") dcd "
                        + "        on di.user_id = dcd.user_id "
                        + "       and di.discharge_no = dcd.discharge_no "
                        + "inner join (select user_id, discharge_no, GROUP_CONCAT(material_no) materials "
                        + "            from   discharge_material "
                        + "            where  user_id = '" + userId + "' "
                        + "              and  discharge_no = " + dischargeNo + ") dm "
                        + "        on di.user_id = dm.user_id "
                        + "       and di.discharge_no = dm.discharge_no "
                        + "where  di.user_id = '" + userId + "' "
                        + "  and  di.discharge_no = " + dischargeNo + " ";
                        
        console.log("getDischargeDetail -->" + selectQuery);

        var selectResult = await entityManager.query(selectQuery);

        res.json(selectResult[0]);
    }

    // 분리배출 데이터 등록
    static insertDischarge = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId, title, maker, cleanYn, materials, level} = req.body;
        const entityManager = getManager();

        // upload 사진 가져오기
        var picture = JSON.parse(JSON.stringify(req.file));

        // 등록번호 계산하기
        var selectQuery = "select max(coalesce(discharge_no,0)) as count from discharge_info where user_id = '" + userId + "'";
        var selectResult1 = await entityManager.query(selectQuery);
        var count = selectResult1[0].count;
        count = count * 1 + 1;
        
        // 대괄호 제거 - 정규식을 몰라서 그냥 이렇게 함
        let rpLvl = level;
        rpLvl = rpLvl.replace('[', '');
        rpLvl = rpLvl.replace(']', '');

        let rpCtg = cleanYn;
        rpCtg = rpCtg.replace('[', '');
        rpCtg = rpCtg.replace(']', '');

        let rpMtr = materials;
        rpMtr = rpMtr.replace('[', '');
        rpMtr = rpMtr.replace(']', '');

        try {
            var originPath = picture.path;                         // 원본파일
            var resizingPath = 'uploads/rs' + picture.filename;    // 썸네일 파일(리스트 표시)

            const sharp = require('sharp');
            sharp(originPath)
                .resize({width:500})
                .withMetadata()
                .toFile(resizingPath, (err, info) => {
                    const fs = require('fs');
                    if(err) throw err
                    fs.unlink(originPath, (err) => {
                        if(err) throw err
                    })
                });

            // 등록 query 생성
            var insertQuery = "insert into discharge_info "
                            + "(user_id, discharge_no, item_title, item_maker, item_picture, difficulty_level) "
                            + "values ( "
                            + " '" + userId + "' "
                            + ", " + count + " "
                            + ",'" + title + "'"
                            + ",'" + maker + "'"
                            + ",'" + resizingPath + "'"
                            + ",'" + rpLvl.trim() + "'"
                            + ")"

            console.log(insertQuery);

            // 등록 query 실행 
            await entityManager.query(insertQuery);

            // 세척/분리 등록
            var category = rpCtg.split(',');

            console.log(category);

            for(var i = 0 ; i < category.length ; i++){
                var insertSubQuery = "insert into discharge_clean_div values ('" + userId + "', " + count + ", trim('" + category[i] + "'))";
                await entityManager.query(insertSubQuery);
            }

            // 재질정보 등록
            var material = rpMtr.split(',');

            for(var i = 0 ; i < material.length ; i++){
                var insertSubQuery = "insert into discharge_material values ('" + userId + "', " + count + ", trim('" + material[i] + "'))";
                await entityManager.query(insertSubQuery);
            }

            res.json({result:"success"});
        } catch (exception){
            console.log(exception);
            res.json({result:"fail"});
        }
    }

    // 분리배출 사진수정
    static updatePicture = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId, dischargeNo} = req.body;
        const entityManager = getManager();

        // 기존 사진 체크
        var query = "select coalesce(item_picture,'') as filePath from discharge_info where user_id = '" + userId + "' and discharge_no = " + dischargeNo;
        const resultQuery = await entityManager.query(query);
        const path = JSON.parse(JSON.stringify(resultQuery));
        const filePath = path[0].filePath;
        var originFilePath = filePath;

        var replacePicture = JSON.parse(JSON.stringify(req.file));
        console.log(originFilePath);
        console.log(replacePicture);

        // 기존 사진이 있으면 해당 파일 삭제 후 진행
        if (replacePicture != null) {
            if (filePath != ''){
                const fs = require('fs');
                fs.unlink(filePath, function(err){
                    if(err)throw err;
                });

                originFilePath = replacePicture;
            }
        }

        try {
            var originPath = replacePicture.path;                         // 원본파일
            var resizingPath = 'uploads/rs' + replacePicture.filename;    // 파일크기 조정

            const sharp = require('sharp');
            sharp(originPath)
                .resize({width:500})
                .withMetadata()
                .toFile(resizingPath, (err, info) => {
                    const fs = require('fs');
                    if(err) throw err
                    fs.unlink(originPath, (err) => {
                        if(err) throw err
                    })
                });

            // 사진 수정 query 생성
            var updateQuery = "update discharge_info set "
                            + "item_picture = '" + resizingPath + "', "
                            + "mod_date = now() "
                            + "where user_id = '" + userId + "' "
                            + "  and discharge_no = " + dischargeNo + " ";

            // 사진 수정 query 실행 
            var updateResult = await entityManager.query(updateQuery);
        } catch (exception){
            console.log(exception);
        }

        // 처리결과 return
        if (updateResult.changedRows > 0) {
            res.json({result : resizingPath});
        } else {
            res.json({result :"fail"});
        }
    }

    // 분리배출 데이터 수정 
    static updateDischarge = async (req, res) => {
        // Post로 넘어오는 parameter 받기

        console.log(req.body);

        const {userId, dischargeNo, title, maker, cleanYn, materials, level} = req.body;
        const entityManager = getManager();

        // 대괄호 제거 - 정규식을 몰라서 그냥 이렇게 함
        let rpLvl = level;
        // rpLvl = rpLvl.replace('[', '');
        // rpLvl = rpLvl.replace(']', '');

        let rpCtg = cleanYn;
        // rpCtg = rpCtg.replace('[', '');
        // rpCtg = rpCtg.replace(']', '');

        let rpMtr = materials;
        // rpMtr = rpMtr.replace('[', '');
        // rpMtr = rpMtr.replace(']', '');

        // 수정 query 생성
        var updateQuery = "update discharge_info set "
                        + "item_title = '" + title + "', "
                        + "item_maker = '" + maker + "', "
                        + "difficulty_level = '" + rpLvl + "', "
                        + "mod_date = now() "
                        + "where user_id = '" + userId + "' and discharge_no = " + dischargeNo;
        console.log(updateQuery);
        
        // 수정 query 실행 
        await entityManager.query(updateQuery);

        // 재질정보 수정(삭제 후 재등록)
        var deleteQuery1 = "delete from discharge_clean_div where user_id = '" + userId + "' and discharge_no = " + dischargeNo;
        await entityManager.query(deleteQuery1);

        var category = rpCtg.split(',');

        for(var i = 0 ; i < category.length ; i++){
            var insertSubQuery = "insert into discharge_clean_div values ('" + userId + "', " + dischargeNo + ", trim('" + category[i] + "'))";
            await entityManager.query(insertSubQuery);
        }

        // 재질정보 수정(삭제 후 재등록)
        var deleteQuery2 = "delete from discharge_material where user_id = '" + userId + "' and discharge_no = " + dischargeNo;
        await entityManager.query(deleteQuery2);

        var material = rpMtr.split(',');

        for(var i = 0 ; i < material.length ; i++){
            var insertSubQuery = "insert into discharge_material values ('" + userId + "', " + dischargeNo + ", trim('" + material[i] + "'))";
            await entityManager.query(insertSubQuery);
        }

        res.json({result :"success"});

    }

    // 분리배출 데이터 삭제
    static deleteDischarge = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {userId, dischargeNo} = req.body;
        const entityManager = getManager();

        // 데이터 삭제 시, 사진파일도 삭제
        var query = "select coalesce(item_picture,'') as filePath from discharge_info where user_id = '" + userId + "' and discharge_no = " + dischargeNo;
        const resultQuery = await entityManager.query(query);
        const path = JSON.parse(JSON.stringify(resultQuery));
        const filePath = path[0].filePath;

        if (filePath != ''){
            const fs = require('fs');
            fs.unlink(filePath, function(err){
                if(err)throw err;
            });
        }

        // 삭제 query 생성
        var deleteQuery1 = "delete from discharge_info where user_id = '" + userId + "' and discharge_no = " + dischargeNo;
        console.log(deleteQuery1);
        
        // 삭제 query 실행 
        await entityManager.query(deleteQuery1);

        // 세척/분리 삭제
        var deleteQuery2 = "delete from discharge_clean_div where user_id = '" + userId + "' and discharge_no = " + dischargeNo;
        await entityManager.query(deleteQuery2);

        // 재질정보 삭제
        var deleteQuery3 = "delete from discharge_material where user_id = '" + userId + "' and discharge_no = " + dischargeNo;
        await entityManager.query(deleteQuery3);

        res.json({result :"success"});

    }
}