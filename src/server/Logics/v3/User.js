/** Create User */
const async = require("async");
const _ = require("lodash");
const Const = require("../../lib/consts");
const Utils = require("../../lib/utils");
const Path = require("path");
const easyImg = require("easyimage");
const UserModel = require("../../Models/User");
const GroupModel = require("../../Models/Group");
const HistoryModel = require("../../Models/History");
const OrganizationModel = require("../../Models/Organization");
const UpdateOrganizationDiskUsageLogic = require("./UpdateOrganizationDiskUsage");
const PermissionLogic = require("./Permission");
const NewUserLogic = require("./NewUser");
const AvatarLogic = require("./Avatar");

const User = {
  create: (baseUser, params, avatar, onSuccess, onError) => {
    const userModel = UserModel.get();
    const groupModel = GroupModel.get();
    const organizationId = baseUser.organizationId;
    async.waterfall(
      [
        // Get organization
        done => {
          const organizationModel = OrganizationModel.get();
          organizationModel.findOne(
            { _id: organizationId },
            (err, organization) => {
              done(err, { organization: organization });
            }
          );
        },
        // Get groups
        (result, done) => {
          const conditions = {
            organizationId: organizationId,
            type: Const.groupType.group
          };
          if (baseUser.permission != Const.userPermission.organizationAdmin)
            conditions._id = { $in: baseUser.groups };

          groupModel.find(
            conditions,
            { name: true, parentId: true },
            (err, groups) => {
              result.groups = groups;
              done(err, result);
            }
          );
        },
        // Check number of Users in organization
        (result, done) => {
          userModel.count(
            { organizationId: organizationId },
            (err, numberOfUsers) => {
              if (numberOfUsers >= result.organization.maxUserNumber) {
                err =
                  "You can't add more Users to this organization. Maximum number of Users in this organization is " +
                  result.organization.maxUserNumber +
                  ".";
              }
              done(err, result);
            }
          );
        },
        (result, done) => {
          NewUserLogic.create(
            params.name,
            params.sortName,
            params.description,
            params.userid,
            params.password,
            params.status,
            organizationId,
            params.permission,
            _.isEmpty(params.groups) ? [] : params.groups,
            avatar,
            (err, created) => {
              result.created = created.user.toObject();
              result.created.id = created.user._id;
              delete result.created._id;
              done(err, result);
            }
          );
        }
      ],
      (err, result) => {
        if (err) {
          if (onError) onError(err);
          return;
        }
        if (onSuccess) {
          delete result.created.password;
          onSuccess(result.created);
        }
      }
    );
  },
  getDetails: (userid, params, onSuccess, onError) => {
    const userModel = UserModel.get();
    userModel.findOne({ _id: userid }, params, (err, foundUser) => {
      if (err && onError) return onError(err);
      result = foundUser.toObject();
      result.id = foundUser._id;
      delete result._id;
      if (onSuccess) onSuccess(result);
    });
  },
  update: (userid, baseUser, params, avatar, onSuccess, onError) => {
    const userModel = UserModel.get();
    async.waterfall(
      [
        done => {
          // get original data
          userModel.findOne({ _id: userid }, (err, original) => {
            done(err, { original: original });
          });
        },
        (result, done) => {
          result.updateParams = {
            name: params.name ? params.name : result.original.name,
            sortName: params.description
              ? params.description
              : result.original.description,
            description: params.description
              ? params.description
              : result.original.description,
            userid: params.userid ? params.userid : result.original.userid,
            status: params.status ? params.status : result.original.status
          };
          if (params.status == 0) {
            result.updateParams.token = [];
            result.updateParams.pushToken = [];
          }
          if (!_.isEmpty(params.password))
            result.updateParams.password = Utils.getHash(params.password);
          if (params.permission) {
            result.updateParams.permission = params.permission;
          } else {
            if (!result.original.permission) {
              result.updateParams.permission = Const.userPermission.subAdmin;
            }
          }

          if (avatar) {
            AvatarLogic.createAvatarData(avatar, (err, avatarData) => {
              if (avatarData) result.updateParams.avatar = avatarData;
              done(err, result);
            });
          } else {
            done(null, result);
          }
        },
        // Update data
        (result, done) => {
          userModel.update(
            { _id: userid },
            result.updateParams,
            (err, updated) => {
              done(err, result);
            }
          );
        },
        // Update organization disk usage
        (result, done) => {
          if (avatar) {
            let size = 0;
            const newSize =
              result.updateParams.avatar.picture.size +
              result.updateParams.avatar.thumbnail.size;
            if (result.original.avatar.picture.size) {
              const originalSize =
                result.original.avatar.picture.size +
                result.original.avatar.thumbnail.size;
              size = newSize - originalSize;
            } else {
              size = newSize;
            }
            UpdateOrganizationDiskUsageLogic.update(
              baseUser.organizationId,
              size,
              (err, updated) => {
                done(err, result);
              }
            );
          } else {
            done(null, result);
          }
        }
      ],
      (err, result) => {
        if (err && onError) return onError(err);
        if (onSuccess) onSuccess(result);
      }
    );
  },
  delete: (deleteUser, baseUser, onSuccess, onError) => {
    async.waterfall(
      [
        done => {
          const userModel = UserModel.get();
          userModel.remove({ _id: deleteUser.id }, (err, deleted) => {
            done(err, null);
          });
        },
        // Update organization disk usage
        (result, done) => {
          const pictureSize = deleteUser.avatar.picture.size;
          const thumbnailSize = deleteUser.avatar.thumbnail.size;
          if (pictureSize) {
            let size = -(pictureSize + thumbnailSize);
            UpdateOrganizationDiskUsageLogic.update(
              baseUser.organizationId,
              size,
              (err, updated) => {
                done(err, null);
              }
            );
          } else {
            done(null, null);
          }
        },
        // remove user from group's users
        (result, done) => {
          const groupModel = GroupModel.get();
          _.each(deleteUser.groups, groupid => {
            groupModel.update(
              { _id: groupid, users: deleteUser.id },
              { $pull: { users: deleteUser.id } },
              (err, updated) => {
                // ignore errors
              }
            );
          });

          done(null, result);
        },
        // remove history
        (result, done) => {
          const historyModel = HistoryModel.get();
          historyModel.remove({ chatId: deleteUser.id }, (err, deleted) => {
            done(err, result);
          });
        }
      ],
      (err, result) => {
        if (err && onError) return onError(err);
        if (onSuccess) onSuccess(result);
      }
    );
  }
};

module["exports"] = User;
