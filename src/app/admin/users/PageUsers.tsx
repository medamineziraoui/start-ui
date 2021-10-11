import React, { useEffect } from 'react';

import {
  Code,
  Badge,
  Wrap,
  WrapItem,
  HStack,
  Avatar,
  Box,
  Icon,
  MenuList,
  MenuDivider,
  MenuItem,
  Heading,
  Portal,
  Button,
  IconButton,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FiEdit,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
  FiPlus,
} from 'react-icons/fi';
import { Link, useRouteMatch } from 'react-router-dom';

import { useAccount } from '@/app/account/service';
import { UserStatus } from '@/app/admin/users/UserStatus';
import {
  useUserDelete,
  useUserList,
  useUserUpdate,
} from '@/app/admin/users/service';
import { Page, PageContent } from '@/app/layout';
import {
  ActionsButton,
  DataList,
  DataListCell,
  DataListHeader,
  DataListFooter,
  DataListRow,
  DateAgo,
  HitZone,
  useToastError,
  useToastSuccess,
  usePaginationFromUrl,
  PaginationButtonFirstPage,
  Pagination,
  PaginationButtonLastPage,
  PaginationButtonNextPage,
  PaginationButtonPrevPage,
  PaginationInfo,
  MenuActionItem,
  MenuAction,
} from '@/components';
import { useMenuAction } from '@/components/MenuAction';

import { AdminNav } from '../AdminNav';

const UserActions = ({ user, ...rest }) => {
  const { account } = useAccount();
  const { path } = useRouteMatch();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const { mutate: userUpdate, ...userUpdateData } = useUserUpdate({
    onSuccess: ({ activated, login }) => {
      if (activated) {
        toastSuccess({
          title: 'Account Activated',
          description: `Account "${login}" activated with success`,
        });
      } else {
        toastSuccess({
          title: 'Account Deactivated',
          description: `Account "${login}" deactivated with success`,
        });
      }
    },
    onError: (_, __, { activated, login }) => {
      if (activated) {
        toastError({
          title: 'Activation Failed',
          description: `Fail to activate "${login}" account`,
        });
      } else {
        toastError({
          title: 'Deactivation Failed',
          description: `Fail to deactivate "${login}" account`,
        });
      }
    },
  });
  const { mutate: userDelete, ...userDeletionData } = useUserDelete(
    user.login,
    {
      onSuccess: ({ activated, login }) => {
        toastSuccess({
          title: 'Account Deleted',
          description: `Account deleted with success`,
        });
      },
      onError: (_, { login }: any) => {
        toastError({
          title: 'Deletion Failed',
          description: `Fail to delete "${login}" account`,
        });
      },
    }
  );
  const activateUser = () => userUpdate({ ...user, activated: true });
  const deactivateUser = () => userUpdate({ ...user, activated: false });
  const deleteUser = () => {
    userDelete({ ...user });
  };

  const menuActions = {
    delete: {
      state: useDisclosure(),
      action: deleteUser,
    },
  };

  const {
    callBackConfirmButton,
    onCloseMenu,
    onToggleMenu,
    isOpenMenu,
  }: any = useMenuAction(menuActions);

  const isActionsLoading =
    userUpdateData.isLoading || userDeletionData.isLoading;

  return (
    <MenuAction
      isLazy
      ActionsButton={ActionsButton}
      isOpen={isOpenMenu}
      callBackCloseMenu={onCloseMenu}
      isActionsLoading={isActionsLoading}
      onToggle={onToggleMenu}
    >
      <Portal>
        <MenuList>
          <MenuItem
            as={Link}
            to={`${path}${user.login}`}
            icon={<Icon as={FiEdit} fontSize="lg" color="gray.400" />}
          >
            Edit
          </MenuItem>
          {user.activated ? (
            <MenuItem
              onClick={() => {
                onCloseMenu();
                deactivateUser();
              }}
              icon={<Icon as={FiXCircle} fontSize="lg" color="gray.400" />}
            >
              Deactivate Account
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => {
                onCloseMenu();
                activateUser();
              }}
              icon={<Icon as={FiCheckCircle} fontSize="lg" color="gray.400" />}
            >
              Activate Account
            </MenuItem>
          )}
          {account.login !== user.login && (
            <>
              <MenuDivider />
              <MenuActionItem
                propsActionHeader={{
                  size: 'xs',
                  mb: '2',
                }}
                menuAction={menuActions.delete}
                propsConfirmButton={{
                  text: 'Confirm',
                  ml: 'auto',
                  size: 'sm',
                  colorScheme: 'red',
                }}
                propsCancelButton={{
                  text: 'Cancel',
                  size: 'sm',
                  variant: 'link',
                }}
                confirmationText="Are your sure?"
                actionCallBack={() => {
                  callBackConfirmButton('delete');
                }}
                text="Delete"
                icon={<Icon as={FiTrash2} fontSize="lg" color="gray.400" />}
              />
            </>
          )}
        </MenuList>
      </Portal>
    </MenuAction>
  );
};

export const PageUsers = () => {
  const { path } = useRouteMatch();
  const { page, setPage } = usePaginationFromUrl();
  const pageSize = 20;
  const { users, totalItems, isLoadingPage } = useUserList({
    page: page - 1,
    size: pageSize,
  });

  useEffect(() => {
    if (!users?.length && page !== 0) {
      setPage(page - 1);
    }
  }, [setPage, users, page]);

  return (
    <Page containerSize="xl" nav={<AdminNav />}>
      <PageContent>
        <HStack mb="4">
          <Box flex="1">
            <Heading size="md">User Management</Heading>
          </Box>
          <Box>
            <Button
              display={{ base: 'none', sm: 'flex' }}
              as={Link}
              to={`${path}create`}
              colorScheme="brand"
              leftIcon={<FiPlus />}
            >
              Create User
            </Button>
            <IconButton
              display={{ base: 'flex', sm: 'none' }}
              aria-label="Create User"
              as={Link}
              to={`${path}create`}
              size="sm"
              colorScheme="brand"
              icon={<FiPlus />}
            />
          </Box>
        </HStack>
        <DataList>
          <DataListHeader isVisible={{ base: false, md: true }}>
            <DataListCell colName="login" colWidth="2">
              Login / Email
            </DataListCell>
            <DataListCell
              colName="id"
              colWidth="4rem"
              isVisible={{ base: false, lg: true }}
            >
              ID
            </DataListCell>
            <DataListCell
              colName="authorities"
              isVisible={{ base: false, lg: true }}
            >
              Authorities
            </DataListCell>
            <DataListCell
              colName="created"
              isVisible={{ base: false, lg: true }}
            >
              Created by
            </DataListCell>
            <DataListCell
              colName="lastModified"
              isVisible={{ base: false, md: true }}
            >
              Modified by
            </DataListCell>
            <DataListCell
              colName="status"
              colWidth={{ base: '2rem', md: '0.5' }}
              align="center"
            >
              <Box as="span" d={{ base: 'none', md: 'block' }}>
                Status
              </Box>
            </DataListCell>
            <DataListCell colName="actions" colWidth="4rem" align="flex-end" />
          </DataListHeader>
          {users?.map((user) => (
            <DataListRow key={user.id}>
              <DataListCell
                colName="login"
                as={Link}
                to={`${path}${user.login}`}
              >
                <HitZone />
                <HStack maxW="100%">
                  <Avatar size="sm" name={user.login} mx="1" />
                  <Box minW="0">
                    <Text isTruncated maxW="full" fontWeight="bold">
                      {user.login}
                    </Text>
                    <Text
                      isTruncated
                      maxW="full"
                      fontSize="sm"
                      color="gray.600"
                    >
                      {user.email}
                    </Text>
                  </Box>
                </HStack>
              </DataListCell>
              <DataListCell colName="id">
                <Text isTruncated maxW="full" as={Code} fontSize="xs">
                  {user.id}
                </Text>
              </DataListCell>
              <DataListCell colName="authorities">
                <Wrap>
                  {user.authorities?.map((authority) => (
                    <WrapItem key={authority}>
                      <Badge size="sm">{authority}</Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              </DataListCell>
              <DataListCell
                colName="created"
                fontSize="sm"
                position="relative"
                pointerEvents="none"
              >
                <Text isTruncated maxW="full">
                  {user.createdBy}
                </Text>
                {!!user.createdDate && (
                  <Text
                    isTruncated
                    maxW="full"
                    color="gray.600"
                    pointerEvents="auto"
                  >
                    <DateAgo date={user.createdDate} />
                  </Text>
                )}
              </DataListCell>
              <DataListCell
                colName="lastModified"
                fontSize="sm"
                position="relative"
                pointerEvents="none"
              >
                <Text isTruncated maxW="full">
                  {user.lastModifiedBy}
                </Text>
                {!!user.lastModifiedDate && (
                  <Text
                    isTruncated
                    maxW="full"
                    color="gray.600"
                    pointerEvents="auto"
                  >
                    <DateAgo position="relative" date={user.lastModifiedDate} />
                  </Text>
                )}
              </DataListCell>
              <DataListCell colName="status">
                <UserStatus isActivated={user.activated} />
              </DataListCell>
              <DataListCell colName="actions">
                <UserActions user={user} />
              </DataListCell>
            </DataListRow>
          ))}
          <DataListFooter>
            <Pagination
              isLoadingPage={isLoadingPage}
              setPage={setPage}
              page={page}
              pageSize={pageSize}
              totalItems={totalItems}
            >
              <PaginationButtonFirstPage />
              <PaginationButtonPrevPage />
              <PaginationInfo flex="1" />
              <PaginationButtonNextPage />
              <PaginationButtonLastPage />
            </Pagination>
          </DataListFooter>
        </DataList>
      </PageContent>
    </Page>
  );
};
