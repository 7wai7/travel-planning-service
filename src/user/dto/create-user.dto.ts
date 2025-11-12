export default class CreateUserDto {
    readonly username: string;
    readonly email: string;
    readonly hash_password: string;
}