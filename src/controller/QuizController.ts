import {getRepository, getConnection, getManager} from "typeorm";
import { fstat } from "node:fs";

export class QuizController {

    // 할당된 퀴즈 조회 
    static getQuiz = async (req, res) => {
        const {userId} = req.body;
        const entityManager = getManager();

        var selectQuery = "select qi.quiz_no, quiz_title, pass_yn "
                        + "from   user_quiz uq inner join quiz_info qi "
                        + "                            on uq.quiz_no = qi.quiz_no "
                        + "where  uq.user_id = '" + userId + "'";

        var selectResult = await entityManager.query(selectQuery);
        var result = JSON.parse(JSON.stringify(selectResult));
 
        if (result.length == 0){
            // 등록된 퀴즈가 없을 경우
            res.json({result:"n", list:[], resultMsg:"아직 등록된 퀴즈가 없습니다."});
            return false;
        } else 
        // if (result[0].pass_yn == 'y') {
        //     // 등록된 퀴즈가 있고 퀴즈를 통과한 경우
        //     res.json({result:"n", resultMsg:"이미 퀴즈를 통과하셨습니다."});
        //     return false;
        // } 
        // else 
        {
            var pass = 'y'
            var quizNo = '';
            for (var i = 0; i < result.length; i++){
                if(result[i].pass_yn == 'n' || result[i].pass_yn == null) {
                    pass = 'n';
                    quizNo = result[i].quiz_no;
                    break;
                }
            }

            if (pass == 'n'){
                    // 등록된 퀴즈가 있는 경우
                selectQuery = "select qi.quiz_no "
                            + "     , qsi.question_no as questionNo "
                            + "     , qsi.question_content as questionContent "
                            + "from   user_quiz uq inner join quiz_info qi "
                            + "                            on uq.quiz_no = qi.quiz_no "
                            + "                    inner join question_info qsi "
                            + "                            on qi.quiz_no = qsi.quiz_no "
                            + "where  uq.user_id = '" + userId + "'"
                            + "  and  uq.quiz_no = " + quizNo;
                selectResult = await entityManager.query(selectQuery);
                var result = JSON.parse(JSON.stringify(selectResult));

                for (var i = 0; i < result.length; i++){
                    var selectQuery2 = "select choice_no as choiceNo "
                                    + "     , choice_content as choiceContent "
                                    + "from   choice_info "
                                    + "where  quiz_no = " + quizNo
                                    + "  and  question_no = " + result[i].questionNo;

                    var selectResult2 = await entityManager.query(selectQuery2);
                    var result2 = JSON.parse(JSON.stringify(selectResult2));
                    result[i].choiceList = result2;
                }

                res.json({result:"y", resultMsg:"",list:result});
            } else {
                // 등록된 퀴즈가 있고 퀴즈를 통과한 경우
                res.json({result:"n", list:[], resultMsg:"이미 퀴즈를 통과하셨습니다."});
            }
            
            return false;
        }
    }

    // 퀴즈 답변 전송
    static sendQuiz = async (req, res) => {
        const {quizNo, userId, answer} = req.body;
        const entityManager = getManager();

        // 정답 체크를 위한 데이터 조회
        var selectQuery = "select qsi.question_no as questionNo "
                        + "     , qsi.question_answer as questionAnswer "
                        + "from   user_quiz uq inner join quiz_info qi "
                        + "                            on uq.quiz_no = qi.quiz_no "
                        + "                    inner join question_info qsi "
                        + "                            on qi.quiz_no = qsi.quiz_no "
                        + "where  uq.quiz_no = " + quizNo
                        + "  and  uq.user_id = '" + userId + "'";
        
        var selectResult = await entityManager.query(selectQuery);
        var result = JSON.parse(JSON.stringify(selectResult));

        var passYn = '';
        for (var i = 0; i < result.length; i++){
            if (answer[i] != result[i].questionAnswer) {
                passYn = 'n';
                break;
            } 
        }

        if (passYn == 'n'){
            res.json({result:"통과하지 못하셨습니다.\n다음에 다시 응시해주시기 바랍니다."});
            return false;
        } else {
            var updateQuery = "update user_quiz set pass_yn = 'y' where quiz_no = " + quizNo + " and user_id = '" + userId + "'";
            await entityManager.query(updateQuery);

            res.json({result:"퀴즈를 통과하셨습니다."});
            return false;
        }
    }
}