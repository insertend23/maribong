/* 사용자정보 */
create table user_info(
	user_id varchar(20) not null								/* 아이디 */
  , user_pwd varchar(20) not null								/* 비밀번호 */
  , user_name varchar(100) 										/* 닉네임 */
  , user_token mediumtext										/* 토큰 */
  , user_profile mediumtext										/* 프로필사진 경로 */
  , user_sex varchar(1)											/* 성별 - 1:남자 / 2:여자 */
  , user_birth_year int											/* 생년 */
  , user_birth_month int										/* 생월 */
  , user_home_category varchar(1)								/* 거주형태 - 1:아파트 / 2:주택 / 3: 기숙사 (delete)*/
  , user_city1 varchar(100)										/* 주소1 (delete)*/
  , user_city2 varchar(100)										/* 주소2 (delete)*/
  , user_push_chk varchar(1) default '1'						/* 푸시 알림여부 - 1:yes / 2:no */
  , reg_date datetime not null default current_timestamp		/* 등록일시 */
  , mod_date datetime not null default current_timestamp		/* 수정일시 */
  , primary key(user_id)
) default charset=utf8 collate utf8_general_ci;


/* 커뮤니티 정보 */
create table community_info(
	user_id varchar(20) not null								/* 아이디 */
  , community_no int(10)										/* 커뮤니티 등록번호 */
  , content mediumtext											/* 내용 */
  , reg_date datetime not null default current_timestamp		/* 등록일시 */
  , mod_date datetime not null default current_timestamp		/* 수정일시 */
  , primary key(user_id, community_no)
) default charset=utf8 collate utf8_general_ci;

alter table community_info add column mark varchar(1);		/*봉사인증*/
alter table community_info add column country varchar(100);		/*국가명*/
alter table community_info add column group_name varchar(100);	/*그룹명*/
alter table community_info add column area_name varchar(100);	/*장소명*/
alter table community_info add column reaction mediumtext;		/*반응*/


/* 커뮤니티 사진정보 */
create table community_photo(
	user_id varchar(20) not null								/* 아이디 */
  , community_no int(10)										/* 커뮤니티 등록번호 */
  , photo_no int(10)											/* 사진번호 */
  , photo_path mediumtext										/* 사진경로 */
  , primary key(user_id, community_no, photo_no)
) default charset=utf8 collate utf8_general_ci;

/* 커뮤니티 댓글정보 */
create table community_reply(
	user_id varchar(20) not null								/* 아이디 */
  , community_no int(10)										/* 커뮤니티 등록번호 */
  , reply_no int(10)											/* 댓글번호 */
  , auser_id varchar(20)										/* 댓글작성자 아이디 */
  , content mediumtext											/* 댓글내용 */
  , reg_date datetime default current_timestamp
  , mod_date datetime default current_timestamp
  , primary key(user_id, community_no, reply_no)
) default charset=utf8 collate utf8_general_ci;

/* 커뮤니티 좋아요 정보 */
create table community_contect(
	user_id varchar(20) not null								/* 아이디 */
  , community_no int(10)										/* 커뮤니티 등록번호 */
  , auser_id varchar(20)										/* 좋아요 누른 아이디 */
  , reg_date datetime default current_timestamp
  , primary key(user_id, community_no, auser_id)
) default charset=utf8 collate utf8_general_ci;


/* 퀴즈 문항 */
create table question_info(
	question_no int(10) not null								/* 퀴즈문항번호 */
  , quiz_no int(10)												/* 퀴즈번호 */
  , question_content varchar(200)								/* 문항내용 */
  , question_answer int(10)										/* 정답 */
  , reg_date datetime default current_timestamp
  , mod_date datetime default current_timestamp
  , primary key(question_no, quiz_no)
) default charset=utf8 collate utf8_general_ci;

/* 퀴즈 선택지 */
create table choice_info(
	choice_no int(10) not null									/* 선택지번호 */
  , question_no int(10) not null								/* 퀴즈문항번호 */
  , quiz_no int(10)												/* 퀴즈번호 */
  , choice_content varchar(200)									/* 문항내용 */
  , reg_date datetime default current_timestamp
  , mod_date datetime default current_timestamp
  , primary key(choice_no, question_no, quiz_no)
) default charset=utf8 collate utf8_general_ci;

/* 퀴즈 할당 */
create table user_quiz(
	user_id varchar(20)
  , quiz_no int(10)
  , pass_yn varchar(1)
  , primary key(user_id, quiz_no)
) default charset=utf8 collate utf8_general_ci;

/* 봉사인증기록 */
create table history(
	id int(10) auto_increment									/* 번호 */
  , history_userId varchar(20) not null							/* 아이디 */
  , history_title varchar(20)										/* 기록내용 */
  , term varchar(50)											/* 기간 */
  , primary key(id)
) default charset=utf8 collate utf8_general_ci;

