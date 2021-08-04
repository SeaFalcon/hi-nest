import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsDate, IsEmail, IsPhoneNumber } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@InputType({ isAbstract: true })
@ObjectType()
@Entity({ name: 'member_admin_tb' })
export class Admin {
  @Field(() => Number)
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'mba_seq',
    comment: '관리자 시퀀스',
  })
  mbaSeq: number;

  @Field(() => String)
  @Column('varchar', { name: 'mba_id', comment: '관리자 아이디', length: 32 })
  mbaId: string;

  @Field(() => String)
  @Column('varchar', { name: 'mba_pw', comment: '관리자 비밀번호', length: 64 })
  mbaPw: string;

  @Field(() => String, { nullable: true })
  @Column('varchar', {
    name: 'mba_role',
    nullable: true,
    comment: '관리자 관리권한',
    length: 32,
  })
  mbaRole?: string | null;

  @Field(() => String)
  @Column('varchar', { name: 'mba_name', comment: '관리자 이름', length: 32 })
  mbaName: string;

  @Field(() => String, { nullable: true })
  @Column('varchar', {
    name: 'mba_tel',
    nullable: true,
    comment: '관리자 전화번호',
    length: 16,
  })
  @IsPhoneNumber('KR')
  mbaTel?: string | null;

  @Field(() => String, { nullable: true })
  @Column('varchar', {
    name: 'mba_email',
    nullable: true,
    comment: '관리자 이메일',
    length: 64,
  })
  @IsEmail()
  mbaEmail?: string | null;

  @Field(() => String, { nullable: true })
  @Column('varchar', {
    name: 'mba_ext_tel',
    nullable: true,
    comment: '관리자 내선 번호',
    length: 16,
  })
  mbaExtTel?: string | null;

  @Field(() => String, { nullable: true })
  @Column('varchar', {
    name: 'mba_department',
    nullable: true,
    comment: '관리자 부서',
    length: 32,
  })
  mbaDepartment?: string | null;

  @Field(() => String, { nullable: true })
  @Column('varchar', {
    name: 'mba_title',
    nullable: true,
    comment: '관리자 직함',
    length: 32,
  })
  mbaTitle?: string | null;

  @Field(() => Date, { nullable: true })
  @Column('date', {
    name: 'mba_join_date',
    nullable: true,
    comment: '관리자 입사일',
  })
  @IsDate()
  mbaJoinDate?: string | null;

  @Field(() => Date, { nullable: true })
  @Column('date', {
    name: 'mba_resignation_date',
    nullable: true,
    comment: '관리자 퇴사일',
  })
  @IsDate()
  mbaResignationDate?: string | null;

  @Field(() => String, { nullable: true })
  @Column('text', { name: 'mba_memo', nullable: true, comment: '관리자 비고' })
  mbaMemo?: string | null;

  @Field(() => String, { nullable: true })
  @Column('varchar', {
    name: 'mba_status',
    nullable: true,
    comment: '관리자 상태(현황)',
    length: 16,
  })
  mbaStatus?: string | null;

  @Field(() => Date)
  @Column('datetime', { name: 'mba_regdate', comment: '관리자 등록일' })
  @IsDate()
  mbaRegdate: Date;
}
