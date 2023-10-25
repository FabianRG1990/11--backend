import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {

  constructor(@InjectModel(User.name) private userModel: Model<User>){}

  async create(createUserDto: CreateUserDto): Promise<User> {  
    // const newUser = new this.userModel( createUserDto );
    // return newUser.save();

    try{
      const newUser = new this.userModel( createUserDto );

          // 1- encriptar la contraseña

    // 2- guardar el usuario

    // 3- generar el JWT [jason wed token]

      return await newUser.save();
    }catch(error){
      if(error.code === 11000){
        throw new BadRequestException(`${createUserDto.email}  ya existe`)
      }
      throw new InternalServerErrorException('Algo salio mal')
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
}
