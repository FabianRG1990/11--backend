import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import * as bcryptjs from 'bcryptjs';


import { RegisterUserDto, LoginDto, UpdateAuthDto, CreateUserDto } from './dto';

import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService

    ){}

  async create(createUserDto: CreateUserDto): Promise<User> {  

      try{
      // 1- encriptar la contraseña
      const { password, ...userData} = createUserDto;

      const newUser = new this.userModel( {
        password: bcryptjs.hashSync( password, 10 ),
        ...userData
      } );

      // 2- guardar el usuario
      
      
      await newUser.save();
      const { password:_, ...user } = newUser.toJSON();
      
      return user;
      
      // const newUser = new this.userModel( createUserDto );
      // return await newUser.save();
    }catch(error){
      if(error.code === 11000){
        throw new BadRequestException(`${createUserDto.email}  ya existe`)
      }
      throw new InternalServerErrorException('Algo salio mal')
    }
    
  }

  async register( registerDto: RegisterUserDto ): Promise<LoginResponse> {

    const user = await this.create(registerDto);
    
    return{
      user: user,
      token: this.getJwtToken({ id: user._id }),
    }
  }
  
  async login( loginDto: LoginDto ): Promise<LoginResponse>  {
    const { email, password } = loginDto;
    
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('credenciales no validadas - email');
    }
    
    if ( !bcryptjs.compareSync( password, user.password ) ) {
      throw new UnauthorizedException('credenciales no validadas - password');
      
    }const {password:_, ...rest} = user.toJSON();
    
    return {
      user:rest,
      token: this.getJwtToken({ id: user.id }),
    }
  }
  
  findAll() {
    return `This action returns all auth`;
  }
  
  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }
  
  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }
  
  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
  
  // 3- generar el JWT [jason wed token]
  getJwtToken( palyload: JwtPayload ) {
    const token = this.jwtService.sign(palyload);
    return token;
  }
}
