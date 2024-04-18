import {getRepository, getConnection, getManager} from "typeorm";
import { fstat } from "node:fs";

export class ImgController {

    // 이미지 업로드
    static uploadImg = async (req, res) => {
        res.json({path :req.file.path});                // 이미지 업로드 경로 리턴
    }

    // 다중 이미지 업로드
    static uploadImgList = async (req, res) => {
        res.json({path :req.files.path});                // 이미지 업로드 경로 리턴
    }
}